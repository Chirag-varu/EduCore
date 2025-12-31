import { Router } from "express";
import certificateController from "../../controllers/student-controller/certificate-controller.js";
import authenticate from "../../middleware/auth-middleware.js";

const {
  getStudentCertificates,
  getCertificateById,
  verifyCertificate,
  generateCertificate,
  getCertificateByCourse,
} = certificateController;

const router = Router();

// Protected routes (require authentication)
router.get("/my-certificates", authenticate, getStudentCertificates);
router.get("/course/:courseId", authenticate, getCertificateByCourse);
router.post("/generate/:courseId", authenticate, generateCertificate);

// Public route for certificate verification (for sharing)
router.get("/verify/:certificateId", verifyCertificate);

// Protected route to get certificate by ID
router.get("/:certificateId", authenticate, getCertificateById);

export default router;
