import { Router } from "express";
import authController from "../../controllers/auth-controller/index.js";
import authenticateMiddleware from "../../middleware/auth-middleware.js";
import { authLimiter, passwordResetLimiter } from "../../middleware/rate-limit.js";
const { registerUser, loginUser, googleLogin, verifyUser, chekAuth, forgotPassword, resetPassword } = authController;
const router = Router();

// Apply rate limiting to authentication endpoints
router.post("/register", authLimiter, registerUser);
router.post("/verifyUser", authLimiter, verifyUser);
router.post("/login", authLimiter, loginUser);
router.post("/google/login", authLimiter, googleLogin);
router.get("/check-auth", authenticateMiddleware, chekAuth);

// Apply stricter rate limiting to password reset endpoints
router.post("/forgotPassword", passwordResetLimiter, forgotPassword);
router.post("/resetPassword/:token", passwordResetLimiter, resetPassword);

export default router;
