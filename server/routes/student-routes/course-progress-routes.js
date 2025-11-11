import { Router } from "express";
import courseProgressController from "../../controllers/student-controller/course-progress-controller.js";
import authenticate from "../../middleware/auth-middleware.js";
const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
  getCourseProgressSummary,
  updateLectureProgress,
  resetCourseProgressV2,
} = courseProgressController;

const router = Router();

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);
// New authenticated routes
router.get("/summary/:courseId", authenticate, getCourseProgressSummary);
router.patch("/:courseId/lecture/:lectureId", authenticate, updateLectureProgress);
router.delete("/:courseId", authenticate, resetCourseProgressV2);
export default router;
