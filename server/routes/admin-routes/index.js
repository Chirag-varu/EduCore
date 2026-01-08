import express from 'express';
import {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  getPlatformAnalytics
} from '../../controllers/admin-controller/user-management-controller.js';
import {
  getCoursesForModeration,
  getCourseDetailsForModeration,
  approveCourse,
  rejectCourse,
  toggleCoursePublication,
  deleteCourse,
  getModerationSummary
} from '../../controllers/admin-controller/course-moderation-controller.js';
import {
  getInstructorsWithCourses,
  getStudentsWithCourses,
  getOverviewStats
} from '../../controllers/admin-controller/overview-controller.js';
import authenticate from '../../middleware/auth-middleware.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticate);

// Overview Routes
router.get('/overview/stats', getOverviewStats);
router.get('/overview/instructors', getInstructorsWithCourses);
router.get('/overview/students', getStudentsWithCourses);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/status', toggleUserStatus);

// Course Moderation Routes
router.get('/courses', getCoursesForModeration);
router.get('/courses/:courseId', getCourseDetailsForModeration);
router.put('/courses/:courseId/approve', approveCourse);
router.put('/courses/:courseId/reject', rejectCourse);
router.put('/courses/:courseId/toggle-publication', toggleCoursePublication);
router.delete('/courses/:courseId', deleteCourse);
router.get('/moderation/summary', getModerationSummary);

// Analytics Routes
router.get('/analytics', getPlatformAnalytics);

export default router;