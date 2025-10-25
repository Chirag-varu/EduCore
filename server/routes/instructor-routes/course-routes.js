import { Router } from "express";
import courseController from "../../controllers/instructor-controller/course-controller.js";
import { 
  getInstructorAnalytics, 
  getCourseAnalytics, 
  getStudentDetailsForInstructor 
} from "../../controllers/instructor-controller/analytics-controller.js";
const { addNewCourse, getAllCourses, getCourseDetailsByID, updateCourseByID, getStudentdetails } = courseController;
const router = Router();


// New route: Get instructor profile and their courses
router.get("/get/instructor/:id", courseController.getInstructorProfileAndCourses);

router.post("/add", addNewCourse);
router.get("/get", getAllCourses);
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);
router.get("/get/getStudentdetails/:id", getStudentdetails);

// Analytics routes
router.get("/analytics/:instructorId", getInstructorAnalytics);
router.get("/analytics/course/:courseId", getCourseAnalytics);
router.get("/student/:studentId/course/:courseId", getStudentDetailsForInstructor);

export default router;
