import { Router } from "express";
import commentController from "../../controllers/student-controller/comment-controller.js";
import authMiddleware from "../../middleware/auth-middleware.js";

const router = Router();

// Get all comments for a specific course
router.get("/course/:courseId", commentController.getCourseComments);

// Add a new comment to a course
router.post("/course/:courseId", authMiddleware, commentController.addCourseComment);

// Update an existing comment
router.put("/:commentId", authMiddleware, commentController.updateCourseComment);

// Delete a comment
router.delete("/:commentId", authMiddleware, commentController.deleteCourseComment);

// Get all comments by a user
router.get("/user/:userId", commentController.getUserComments);

export default router;