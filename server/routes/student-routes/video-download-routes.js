import { Router } from "express";
import videoDownloadController from "../../controllers/student-controller/video-download-controller.js";
import authenticate from "../../middleware/auth-middleware.js";

const router = Router();
const { downloadVideo } = videoDownloadController;

// Protect all download routes with authentication
router.use(authenticate);

// Route to download a specific video
router.get("/download/:courseId/:lectureId", downloadVideo);

export default router;