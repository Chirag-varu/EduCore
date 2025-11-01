import Cart from "../../models/Cart.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";
import mongoose from "mongoose";

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId; // From auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    let cart = await Cart.findCartByUserId(userId);
    
    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.createCartForUser(userId);
    } else if (Array.isArray(cart.items) && cart.items.length > 1) {
      // Ensure no duplicates exist (legacy carts)
      const before = cart.items.length;
      const seen = new Set();
      cart.items = cart.items.filter(it => {
        const key = String(it.courseId);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (cart.items.length !== before) {
        await cart.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    const { courseId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }
    
    // Validate course id
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

  // Check if course exists (use lean to support legacy fields like `price`/`thumbnail`)
  const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Check if user already owns this course
    const studentCourses = await StudentCourses.findOne({
      userId: String(userId),
      "courses.courseId": courseId
    });
    
    if (studentCourses) {
      return res.status(400).json({
        success: false,
        message: "You already own this course"
      });
    }
    
    // Find or create cart
    let cart = await Cart.findCartByUserId(userId);
    if (!cart) {
      cart = await Cart.createCartForUser(userId);
    }
    
    // De-duplicate any existing duplicates just in case
    if (Array.isArray(cart.items) && cart.items.length > 1) {
      const seen = new Set();
      cart.items = cart.items.filter(it => {
        const key = String(it.courseId);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      await cart.save();
    }

    // Check if course is already in cart
    if (cart.isItemInCart(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is already in your cart"
      });
    }
    
    // Add course to cart (normalize field names from Course model)
    const resolvedPrice = typeof course?.pricing === 'number'
      ? course.pricing
      : (typeof course?.price === 'number' ? course.price : 0);

    await cart.addItem({
      courseId: course._id,
      courseTitle: course.title,
      // Provide a safe fallback image string to satisfy schema requirement
      courseImage: course.image || course.thumbnail || "placeholder",
      coursePrice: resolvedPrice,
      instructorId: course.instructorId,
      instructorName: course.instructorName
    });
    
    res.status(200).json({
      success: true,
      message: "Course added to cart successfully",
      data: cart
    });
    
  } catch (error) {
    console.error("Error adding to cart:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === "Course already exists in cart") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to add course to cart"
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { courseId } = req.params;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }
    
    // Find user's cart
    const cart = await Cart.findCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    
    // Check if course is in cart
    if (!cart.isItemInCart(courseId)) {
      return res.status(404).json({
        success: false,
        message: "Course not found in cart"
      });
    }
    
    // Remove course from cart
    await cart.removeItem(courseId);
    
    res.status(200).json({
      success: true,
      message: "Course removed from cart successfully",
      data: cart
    });
    
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove course from cart"
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Find user's cart
    let cart = await Cart.findCartByUserId(userId);
    if (!cart) {
      cart = await Cart.createCartForUser(userId);
    }
    
    // Clear cart
    await cart.clearCart();
    
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
    
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
};

// Get cart item count
const getCartCount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const cart = await Cart.findCartByUserId(userId);
    const count = cart ? cart.totalItems : 0;
    
    res.status(200).json({
      success: true,
      data: { count }
    });
    
  } catch (error) {
    console.error("Error getting cart count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart count"
    });
  }
};

// Check if course is in cart
const checkItemInCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { courseId } = req.params;
    
  const cart = await Cart.findCartByUserId(userId);
    const inCart = cart ? cart.isItemInCart(courseId) : false;
    
    res.status(200).json({
      success: true,
      data: { inCart }
    });
    
  } catch (error) {
    console.error("Error checking item in cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check if item is in cart"
    });
  }
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getCartCount,
  checkItemInCart
};