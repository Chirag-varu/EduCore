import express from "express";
import authenticate from "../../middleware/auth-middleware.js";
import completionQuizController from "../../controllers/student-controller/completion-quiz-controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate/Get completion quiz for a course
router.get("/course/:courseId/quiz", completionQuizController.generateCompletionQuiz);

// Start a quiz attempt
router.post("/quiz/:quizId/start", completionQuizController.startQuizAttempt);

// Submit quiz answers
router.post("/attempt/:attemptId/submit", completionQuizController.submitQuiz);

// Get quiz attempt history for a course
router.get("/course/:courseId/attempts", completionQuizController.getQuizAttempts);

// Get user's certificates
router.get("/certificates", completionQuizController.getUserCertificates);

// Verify/Get certificate (public route - moved to separate handler)
router.get("/certificate/:certificateId", completionQuizController.getCertificate);

export default router;
