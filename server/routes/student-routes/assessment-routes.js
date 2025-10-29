import express from 'express';
import multer from 'multer';
import {
  getStudentQuizzes,
  startQuizAttempt,
  getActiveQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  getQuizResults,
  getStudentQuizHistory
} from '../../controllers/student-controller/quiz-controller.js';
import {
  getStudentAssignments,
  getAssignmentDetailsForStudent,
  getOrCreateSubmission,
  saveDraftSubmission,
  uploadAssignmentFile,
  removeAssignmentFile,
  submitAssignment,
  getAssignmentResults,
  getStudentAssignmentHistory
} from '../../controllers/student-controller/assignment-controller.js';
import authenticate from '../../middleware/auth-middleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Apply authentication middleware
router.use(authenticate);

// Quiz routes
router.get('/quiz/course/:courseId', getStudentQuizzes);
router.post('/quiz/:quizId/start', startQuizAttempt);
router.get('/quiz/attempt/:attemptId', getActiveQuizAttempt);
router.put('/quiz/attempt/:attemptId/answer', saveQuizAnswer);
router.post('/quiz/attempt/:attemptId/submit', submitQuizAttempt);
router.get('/quiz/results/:attemptId', getQuizResults);
router.get('/quiz/history/:courseId', getStudentQuizHistory);

// Assignment routes
router.get('/assignment/course/:courseId', getStudentAssignments);
router.get('/assignment/:assignmentId', getAssignmentDetailsForStudent);
router.get('/assignment/:assignmentId/submission', getOrCreateSubmission);
router.put('/submission/:submissionId/draft', saveDraftSubmission);
router.post('/submission/:submissionId/upload', upload.single('file'), uploadAssignmentFile);
router.delete('/submission/:submissionId/file/:fileId', removeAssignmentFile);
router.post('/submission/:submissionId/submit', submitAssignment);
router.get('/submission/:submissionId/results', getAssignmentResults);
router.get('/assignment/history/:courseId', getStudentAssignmentHistory);

export default router;