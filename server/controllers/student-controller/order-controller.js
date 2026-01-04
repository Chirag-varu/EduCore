import payment from "../../helpers/paypal.js";
import Order from "../../models/Order.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";

const createOrder = async (req, res) => {
  try {
    // Support Idempotency-Key via header or body
    const idempotencyKey = req.headers["idempotency-key"] || req.body?.idempotencyKey;

    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey }).lean();
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Order already created",
          data: {
            approveUrl: existing.approvalUrl,
            orderId: existing._id,
          },
        });
      }
    }
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    // Helper function to extract string ID from various formats
    const extractIdString = (id) => {
      if (!id) return '';
      if (typeof id === 'string') return id;
      if (id.$oid) return id.$oid; // MongoDB Extended JSON format
      if (id._id) return extractIdString(id._id);
      if (typeof id.toString === 'function' && id.toString() !== '[object Object]') {
        return id.toString();
      }
      return '';
    };

    // Ensure courseId is a valid string
    const courseIdStr = extractIdString(courseId);
    
    if (!courseIdStr || courseIdStr === '[object Object]') {
      console.error("Invalid courseId received:", courseId);
      return res.status(400).json({
        success: false,
        message: "Invalid course ID. Please try again.",
      });
    }
    
    console.log("Creating order with courseId:", courseIdStr);

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment-return`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseTitle,
                sku: courseIdStr,
                price: coursePricing,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: coursePricing.toFixed(2),
          },
          description: courseTitle,
        },
      ],
    };

    payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment!",
        });
      } else {
        const approveUrl = paymentInfo.links.find(
          (link) => link.rel == "approval_url"
        ).href;

        const newlyCreatedCourseOrder = new Order({
          userId,
          userName,
          userEmail,
          orderStatus,
          paymentMethod,
          paymentStatus,
          orderDate,
          paymentId,
          payerId,
          instructorId,
          instructorName,
          courseImage,
          courseTitle,
          courseId: courseIdStr,  // Use the sanitized string version
          coursePricing,
          idempotencyKey: idempotencyKey || undefined,
          approvalUrl: approveUrl,
        });

        await newlyCreatedCourseOrder.save();

        res.status(201).json({
          success: true,
          data: {
            approveUrl,
            orderId: newlyCreatedCourseOrder._id,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    console.log("Capture payment request:", { paymentId, payerId, orderId });

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    console.log("Order found:", { courseId: order.courseId, courseTitle: order.courseTitle });

    // Validate courseId - it should be a valid ObjectId string
    const courseIdStr = String(order.courseId);
    if (!courseIdStr || courseIdStr === "[object Object]" || courseIdStr.includes(",")) {
      console.error("Invalid courseId in order:", order.courseId);
      return res.status(400).json({
        success: false,
        message: "Invalid course ID in order. Please create a new order.",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    await order.save();

    //update student course model - prevent duplicates
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      // Check if course already exists to prevent duplicates
      const courseExists = studentCourses.courses.some(
        (course) => course.courseId === order.courseId
      );
      
      if (!courseExists) {
        studentCourses.courses.push({
          courseId: order.courseId,
          title: order.courseTitle,
          instructorId: order.instructorId,
          instructorName: order.instructorName,
          dateOfPurchase: order.orderDate,
          courseImage: order.courseImage,
        });
        await studentCourses.save();
      }
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.error("capturePaymentAndFinalizeOrder error:", err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export default { createOrder, capturePaymentAndFinalizeOrder };
