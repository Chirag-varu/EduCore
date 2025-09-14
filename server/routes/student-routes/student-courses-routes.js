import { Router } from "express";
import studentCoursesController from "../../controllers/student-controller/student-courses-controller.js";
import authMiddleware from "../../middleware/auth-middleware.js";

const { getCoursesByStudentId, checkStudentCourseAccess } = studentCoursesController;

const router = Router();

router.get("/get/:studentId", getCoursesByStudentId);
router.get("/check/:courseId", authMiddleware, checkStudentCourseAccess);

export default router;
