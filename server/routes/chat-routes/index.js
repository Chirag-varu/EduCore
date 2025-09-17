import { Router } from "express";
import chatController from "../../controllers/chat-controller/index.js";
import authMiddleware from "../../middleware/auth-middleware.js";

const router = Router();

// Get all chats for an instructor
router.get("/instructor/:instructorId", authMiddleware, chatController.getInstructorChats);

// Get all chats for a student
router.get("/student/:studentId", authMiddleware, chatController.getStudentChats);

// Get a specific chat by ID
router.get("/:chatId", authMiddleware, chatController.getChatById);

// Get or create a chat for a specific course and student
router.post("/course/:courseId/student/:studentId", authMiddleware, chatController.getOrCreateCourseChat);

// Send a message in a chat
router.post("/:chatId/message", authMiddleware, chatController.sendMessage);

// Mark all messages as read
router.put("/:chatId/read", authMiddleware, chatController.markMessagesAsRead);

export default router;