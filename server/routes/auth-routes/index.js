import { Router } from "express";
import authController from "../../controllers/auth-controller/index.js";
import authenticateMiddleware from "../../middleware/auth-middleware.js";
const { registerUser, loginUser, googleLogin, verifyUser, chekAuth } = authController;
const router = Router();

router.post("/register", registerUser);
router.post("/verifyUser", verifyUser);
router.post("/login", loginUser);
router.post("/google/login", googleLogin);
router.get("/check-auth", authenticateMiddleware, chekAuth);

export default router;
