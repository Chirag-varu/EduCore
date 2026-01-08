import User from "../../models/User.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";
import Order from "../../models/Order.js";

/**
 * Get all instructors with their courses
 */
export const getInstructorsWithCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { userName: { $regex: search, $options: "i" } },
            { userEmail: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get all instructors
    const instructors = await User.find({
      role: "instructor",
      ...searchFilter,
    })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalInstructors = await User.countDocuments({
      role: "instructor",
      ...searchFilter,
    });

    // Get courses for each instructor
    const instructorsWithCourses = await Promise.all(
      instructors.map(async (instructor) => {
        // Try both ObjectId and string since instructorId storage may vary
        const courses = await Course.find({ 
          $or: [
            { instructorId: instructor._id },
            { instructorId: instructor._id.toString() }
          ]
        })
          .select("title pricing isPublished students createdAt image")
          .lean();

        const totalStudents = courses.reduce(
          (sum, course) => sum + (course.students?.length || 0),
          0
        );
        const totalRevenue = courses.reduce((sum, course) => {
          const courseRevenue = (course.students || []).reduce(
            (s, student) => s + (parseFloat(student.paidAmount) || 0),
            0
          );
          return sum + courseRevenue;
        }, 0);

        return {
          ...instructor,
          courses,
          stats: {
            totalCourses: courses.length,
            publishedCourses: courses.filter((c) => c.isPublished).length,
            totalStudents,
            totalRevenue,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        instructors: instructorsWithCourses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalInstructors / parseInt(limit)),
          totalInstructors,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching instructors with courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching instructors data",
      error: error.message,
    });
  }
};

/**
 * Get all students with their purchased courses
 */
export const getStudentsWithCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { userName: { $regex: search, $options: "i" } },
            { userEmail: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get all students
    const students = await User.find({
      role: "student",
      ...searchFilter,
    })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalStudents = await User.countDocuments({
      role: "student",
      ...searchFilter,
    });

    // Get purchased courses for each student
    const studentsWithCourses = await Promise.all(
      students.map(async (student) => {
        // Get from StudentCourses collection - userId is stored as string
        const studentCoursesDoc = await StudentCourses.findOne({
          userId: student._id.toString(),
        }).lean();

        // Get orders for this student - userId is stored as string
        const orders = await Order.find({
          userId: student._id.toString(),
          orderStatus: "confirmed",
        })
          .select("courseTitle coursePricing orderDate courseImage instructorName")
          .sort({ orderDate: -1 })
          .lean();

        const totalSpent = orders.reduce(
          (sum, order) => sum + (parseFloat(order.coursePricing) || 0),
          0
        );

        return {
          ...student,
          purchasedCourses: studentCoursesDoc?.courses || [],
          orders,
          stats: {
            totalCourses: studentCoursesDoc?.courses?.length || 0,
            totalSpent,
            lastPurchase: orders[0]?.orderDate || null,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        students: studentsWithCourses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStudents / parseInt(limit)),
          totalStudents,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students with courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students data",
      error: error.message,
    });
  }
};

/**
 * Get overview statistics
 */
export const getOverviewStats = async (req, res) => {
  try {
    const [
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      totalOrders,
    ] = await Promise.all([
      User.countDocuments({ role: "instructor" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Order.countDocuments({ orderStatus: "confirmed" }),
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: "confirmed" } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $toDouble: "$coursePricing" },
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get recent orders
    const recentOrders = await Order.find({ orderStatus: "confirmed" })
      .sort({ orderDate: -1 })
      .limit(5)
      .select("userName userEmail courseTitle coursePricing orderDate")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalInstructors,
          totalStudents,
          totalCourses,
          publishedCourses,
          totalOrders,
          totalRevenue,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overview statistics",
      error: error.message,
    });
  }
};
