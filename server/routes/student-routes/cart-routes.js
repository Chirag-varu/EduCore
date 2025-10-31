import { Router } from "express";
import cartController from "../../controllers/student-controller/cart-controller.js";

const router = Router();

const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  clearCart, 
  getCartCount,
  checkItemInCart
} = cartController;

// GET /api/v1/student/cart - Get user's cart
router.get("/", getCart);

// GET /api/v1/student/cart/count - Get cart item count
router.get("/count", getCartCount);

// GET /api/v1/student/cart/check/:courseId - Check if course is in cart
router.get("/check/:courseId", checkItemInCart);

// POST /api/v1/student/cart/add - Add course to cart
router.post("/add", addToCart);

// DELETE /api/v1/student/cart/remove/:courseId - Remove course from cart
router.delete("/remove/:courseId", removeFromCart);

// DELETE /api/v1/student/cart/clear - Clear entire cart
router.delete("/clear", clearCart);

export default router;