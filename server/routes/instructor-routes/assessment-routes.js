import express from 'express';
import {
  createQuiz,
  getInstructorQuizzes,
  getQuizDetails,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuizPublication
} from '../../controllers/instructor-controller/quiz-controller.js';
import {
  createAssignment,
  getInstructorAssignments,
  getAssignmentDetails,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
  bulkGradeSubmissions,
  toggleAssignmentPublication
} from '../../controllers/instructor-controller/assignment-controller.js';
import { authenticateToken } from '../../middleware/auth-middleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Quiz routes
router.post('/quiz', createQuiz);
router.get('/quiz/course/:courseId', getInstructorQuizzes);
router.get('/quiz/:quizId', getQuizDetails);
router.put('/quiz/:quizId', updateQuiz);
router.delete('/quiz/:quizId', deleteQuiz);
router.put('/quiz/:quizId/publish', toggleQuizPublication);

// Question routes
router.post('/quiz/:quizId/question', addQuestion);
router.put('/question/:questionId', updateQuestion);
router.delete('/question/:questionId', deleteQuestion);

// Assignment routes
router.post('/assignment', createAssignment);
router.get('/assignment/course/:courseId', getInstructorAssignments);
router.get('/assignment/:assignmentId', getAssignmentDetails);
router.put('/assignment/:assignmentId', updateAssignment);
router.delete('/assignment/:assignmentId', deleteAssignment);
router.put('/assignment/:assignmentId/publish', toggleAssignmentPublication);

// Grading routes
router.put('/submission/:submissionId/grade', gradeSubmission);
router.put('/assignment/:assignmentId/bulk-grade', bulkGradeSubmissions);

export default router;