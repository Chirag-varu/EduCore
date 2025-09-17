import { Router } from "express";
import courseController from "../../controllers/instructor-controller/course-controller.js";
const { addNewCourse, getAllCourses, getCourseDetailsByID, updateCourseByID, getStudentdetails } = courseController;
const router = Router();


// New route: Get instructor profile and their courses
router.get("/get/instructor/:id", courseController.getInstructorProfileAndCourses);

router.post("/add", addNewCourse);
router.get("/get", getAllCourses);
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);
router.get("/get/getStudentdetails/:id", getStudentdetails);

export default router;
