import { Router } from "express";
import getCoursesByStudentId from "../../controllers/student-controller/student-courses-controller.js";

const router = Router();

router.get("/get/:studentId", getCoursesByStudentId);

export default router;
