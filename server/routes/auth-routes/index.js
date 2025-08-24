import { Router } from "express";
import authController from "../../controllers/auth-controller/index.js";

const { registerUser, loginUser, googleLogin } = authController;

import authenticateMiddleware from "../../middleware/auth-middleware.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google/login", googleLogin);
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
});

export default router;
