import { Router } from "express";
import authController from "../../controllers/auth-controller/index.js";
import authenticateMiddleware from "../../middleware/auth-middleware.js";
const { registerUser, loginUser, googleLogin, verifyUser, chekAuth, forgotPassword, resetPassword } = authController;
const router = Router();

router.post("/register", registerUser);
router.post("/verifyUser", verifyUser);
router.post("/login", loginUser);
router.post("/google/login", googleLogin);
router.get("/check-auth", authenticateMiddleware, chekAuth);

// New forgot/reset password routes
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);

export default router;
