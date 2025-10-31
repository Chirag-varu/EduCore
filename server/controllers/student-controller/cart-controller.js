import Cart from "../../models/Cart.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    let cart = await Cart.findCartByUserId(userId);
    
    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.createCartForUser(userId);
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
    const userId = req.user._id;
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Check if user already owns this course
    const studentCourses = await StudentCourses.findOne({
      userId,
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
    
    // Check if course is already in cart
    if (cart.isItemInCart(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is already in your cart"
      });
    }
    
    // Add course to cart
    await cart.addItem({
      courseId: course._id,
      courseTitle: course.title,
      courseImage: course.thumbnail,
      coursePrice: course.price || 0,
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
    const userId = req.user._id;
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
    const userId = req.user._id;
    
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
    const userId = req.user._id;
    
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
    const userId = req.user._id;
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