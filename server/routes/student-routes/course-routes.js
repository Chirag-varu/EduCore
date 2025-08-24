import { Router } from "express";
import courseController from "../../controllers/student-controller/course-controller.js";
const router = Router();
const { getStudentViewCourseDetails, getAllStudentViewCourses, checkCoursePurchaseInfo } = courseController;

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get("/purchase-info/:id/:studentId", checkCoursePurchaseInfo);

export default router;
