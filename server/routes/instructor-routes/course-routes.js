import { Router } from "express";
import courseController from "../../controllers/instructor-controller/course-controller.js";
const { addNewCourse, getAllCourses, getCourseDetailsByID, updateCourseByID } = courseController;
const router = Router();

router.post("/add", addNewCourse);
router.get("/get", getAllCourses);
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);

export default router;
