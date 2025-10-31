/**
 * API Routes Configuration for EduCore LMS
 * 
 * Centralized configuration for all API endpoints with dynamic URL construction
 * Similar to the pattern shown in the reference image
 */

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const BASE_URL = window?.env?.BACKEND_URL || "http://localhost:5000/api/v1";

// =============================================================================
// API ROUTES CONFIGURATION
// =============================================================================

const API_ROUTES = {
  // Authentication Routes
  studentLogin: `${BASE_URL}/auth/login`,
  adminLogin: `${BASE_URL}/auth/admin-login`,
  studentLogout: `${BASE_URL}/auth/logout`,
  adminLogout: `${BASE_URL}/auth/admin-logout`,
  registerStudent: `${BASE_URL}/auth/register`,
  verifyOTP: `${BASE_URL}/auth/verifyUser`,
  forgotPassword: `${BASE_URL}/auth/forgotPassword`,
  resetPassword: `${BASE_URL}/auth/resetPassword`,
  checkAuth: `${BASE_URL}/auth/check-auth`,
  googleLogin: `${BASE_URL}/auth/google/login`,

  // Student Routes
  getStudent: `${BASE_URL}/student/get`,
  getAllStudents: `${BASE_URL}/student/getStudents`,
  updateStudentProfile: `${BASE_URL}/student/update-profile`,
  getStudentCourses: `${BASE_URL}/student/course/get`,
  getStudentCourseDetails: `${BASE_URL}/student/course/get/details`,
  checkCoursePurchase: `${BASE_URL}/student/course/purchase-info`,
  getStudentBoughtCourses: `${BASE_URL}/student/courses-bought/get`,
  createOrder: `${BASE_URL}/student/order/create`,
  capturePayment: `${BASE_URL}/student/order/capture`,
  getCourseProgress: `${BASE_URL}/student/course-progress/get`,
  markLectureViewed: `${BASE_URL}/student/course-progress/mark-lecture-viewed`,
  resetCourseProgress: `${BASE_URL}/student/course-progress/reset-progress`,
  downloadVideo: `${BASE_URL}/student/video/download`,

  // Instructor Routes
  getInstructorCourses: `${BASE_URL}/instructor/course/get`,
  addCourse: `${BASE_URL}/instructor/course/add`,
  getInstructorCourseDetails: `${BASE_URL}/instructor/course/get/details`,
  updateCourse: `${BASE_URL}/instructor/course/update`,
  deleteCourse: `${BASE_URL}/instructor/course/delete`,
  getCourseStudents: `${BASE_URL}/instructor/course/get/getStudentdetails`,
  publishCourse: `${BASE_URL}/instructor/course/publish`,
  getInstructorAnalytics: `${BASE_URL}/instructor/analytics`,

  // Admin Routes
  getAllCourses: `${BASE_URL}/admin/courses/get-all`,
  approveCourse: `${BASE_URL}/admin/courses/approve`,
  rejectCourse: `${BASE_URL}/admin/courses/reject`,
  getAdminAnalytics: `${BASE_URL}/admin/analytics`,
  getUserManagement: `${BASE_URL}/admin/users`,
  updateAdminPassword: `${BASE_URL}/admin/update-password`,
  getOtherAdminsCredential: `${BASE_URL}/admin/credential`,
  getAdminDashboardStats: `${BASE_URL}/admin/dashboard/stats`,

  // College/Institution Routes
  addCollege: `${BASE_URL}/college/add`,
  getColleges: `${BASE_URL}/college/get-colleges`,
  updateCollege: `${BASE_URL}/college/update`,
  deleteCollege: `${BASE_URL}/college/delete`,

  // Scholarship Routes
  addScholarship: `${BASE_URL}/scholarship/add`,
  getAllScholarships: `${BASE_URL}/scholarship/fetch-all`,
  approveScholarship: `${BASE_URL}/scholarship/approve-students`,
  getScholarshipDetails: `${BASE_URL}/scholarship/details`,
  applyScholarship: `${BASE_URL}/scholarship/apply`,

  // Admission Routes
  admissionForm: `${BASE_URL}/student/fill-details`,
  getAdmissionApplications: `${BASE_URL}/admin/admission/applications`,
  approveAdmission: `${BASE_URL}/admin/admission/approve`,
  rejectAdmission: `${BASE_URL}/admin/admission/reject`,

  // Media Routes
  uploadMedia: `${BASE_URL}/media/upload`,
  bulkUploadMedia: `${BASE_URL}/media/bulk-upload`,
  deleteMedia: `${BASE_URL}/media/delete`,

  // Chat Routes
  getInstructorChats: `${BASE_URL}/chat/instructor`,
  getStudentChats: `${BASE_URL}/chat/student`,
  getChatById: `${BASE_URL}/chat`,
  createCourseChat: `${BASE_URL}/chat/course`,
  sendMessage: `${BASE_URL}/chat/message`,
  markMessagesRead: `${BASE_URL}/chat/read`,

  // Newsletter Routes
  subscribeNewsletter: `${BASE_URL}/newsletter/subscribe`,
  unsubscribeNewsletter: `${BASE_URL}/newsletter/unsubscribe`,
  confirmSubscription: `${BASE_URL}/newsletter/confirm`,
  getNewsletters: `${BASE_URL}/newsletter/admin`,
  createNewsletter: `${BASE_URL}/newsletter/admin/create`,
  updateNewsletter: `${BASE_URL}/newsletter/admin/update`,
  deleteNewsletter: `${BASE_URL}/newsletter/admin/delete`,
  getSubscriptions: `${BASE_URL}/newsletter/admin/subscriptions`,

  // Comment Routes
  addComment: `${BASE_URL}/comment/add`,
  getCourseComments: `${BASE_URL}/comment/course`,
  updateComment: `${BASE_URL}/comment/update`,
  deleteComment: `${BASE_URL}/comment/delete`,
  likeComment: `${BASE_URL}/comment/like`,

  // Search & Filter Routes
  searchCourses: `${BASE_URL}/search/courses`,
  getCategories: `${BASE_URL}/categories`,
  getPopularCourses: `${BASE_URL}/courses/popular`,
  getFeaturedCourses: `${BASE_URL}/courses/featured`,

  // Notification Routes
  getNotifications: `${BASE_URL}/notifications`,
  markNotificationRead: `${BASE_URL}/notifications/read`,
  sendNotification: `${BASE_URL}/notifications/send`,

  // System Routes
  healthCheck: `${BASE_URL}/health`,
  getSystemStats: `${BASE_URL}/system/stats`,
  backupDatabase: `${BASE_URL}/system/backup`,
  getSystemLogs: `${BASE_URL}/system/logs`,
};

// =============================================================================
// DYNAMIC ROUTE BUILDERS
// =============================================================================

/**
 * Build routes with dynamic parameters
 */
const DYNAMIC_ROUTES = {
  // Student routes with parameters
  getStudentById: (id) => `${BASE_URL}/student/get/${id}`,
  getCourseDetails: (courseId) => `${BASE_URL}/student/course/get/details/${courseId}`,
  checkCoursePurchaseInfo: (courseId, studentId) => 
    `${BASE_URL}/student/course/purchase-info/${courseId}/${studentId}`,
  getBoughtCourses: (studentId) => `${BASE_URL}/student/courses-bought/get/${studentId}`,
  getCourseProgressByUser: (userId, courseId) => 
    `${BASE_URL}/student/course-progress/get/${userId}/${courseId}`,
  downloadCourseVideo: (courseId, lectureId) => 
    `${BASE_URL}/student/video/download/${courseId}/${lectureId}`,

  // Instructor routes with parameters
  getInstructorCourseById: (id) => `${BASE_URL}/instructor/course/get/details/${id}`,
  updateCourseById: (id) => `${BASE_URL}/instructor/course/update/${id}`,
  deleteCourseById: (id) => `${BASE_URL}/instructor/course/delete/${id}`,
  getCourseStudentDetails: (id) => `${BASE_URL}/instructor/course/get/getStudentdetails/${id}`,
  publishCourseById: (id) => `${BASE_URL}/instructor/course/publish/${id}`,

  // Admin routes with parameters
  approveStudentCourse: (courseId) => `${BASE_URL}/admin/courses/approve/${courseId}`,
  rejectStudentCourse: (courseId) => `${BASE_URL}/admin/courses/reject/${courseId}`,
  getUserById: (userId) => `${BASE_URL}/admin/users/${userId}`,
  updateUserById: (userId) => `${BASE_URL}/admin/users/update/${userId}`,
  deleteUserById: (userId) => `${BASE_URL}/admin/users/delete/${userId}`,

  // College routes with parameters
  getCollegeById: (id) => `${BASE_URL}/college/get/${id}`,
  updateCollegeById: (id) => `${BASE_URL}/college/update/${id}`,
  deleteCollegeById: (id) => `${BASE_URL}/college/delete/${id}`,

  // Scholarship routes with parameters
  getScholarshipById: (id) => `${BASE_URL}/scholarship/details/${id}`,
  applyForScholarship: (id) => `${BASE_URL}/scholarship/apply/${id}`,
  approveScholarshipById: (id) => `${BASE_URL}/scholarship/approve/${id}`,

  // Media routes with parameters
  deleteMediaById: (id) => `${BASE_URL}/media/delete/${id}`,
  getMediaById: (id) => `${BASE_URL}/media/get/${id}`,

  // Chat routes with parameters
  getInstructorChatsById: (instructorId) => `${BASE_URL}/chat/instructor/${instructorId}`,
  getStudentChatsById: (studentId) => `${BASE_URL}/chat/student/${studentId}`,
  getChatDetailsById: (chatId) => `${BASE_URL}/chat/${chatId}`,
  createCourseChatRoom: (courseId, studentId) => 
    `${BASE_URL}/chat/course/${courseId}/student/${studentId}`,
  sendChatMessage: (chatId) => `${BASE_URL}/chat/${chatId}/message`,
  markChatMessagesRead: (chatId) => `${BASE_URL}/chat/${chatId}/read`,

  // Newsletter routes with parameters
  confirmSubscriptionToken: (token) => `${BASE_URL}/newsletter/confirm/${token}`,
  getNewsletterById: (id) => `${BASE_URL}/newsletter/admin/${id}`,
  updateNewsletterById: (id) => `${BASE_URL}/newsletter/admin/${id}`,
  deleteNewsletterById: (id) => `${BASE_URL}/newsletter/admin/${id}`,

  // Comment routes with parameters
  getCourseCommentsById: (courseId) => `${BASE_URL}/comment/course/${courseId}`,
  updateCommentById: (id) => `${BASE_URL}/comment/update/${id}`,
  deleteCommentById: (id) => `${BASE_URL}/comment/delete/${id}`,
  likeCommentById: (id) => `${BASE_URL}/comment/like/${id}`,

  // Notification routes with parameters
  markNotificationReadById: (id) => `${BASE_URL}/notifications/read/${id}`,
  deleteNotificationById: (id) => `${BASE_URL}/notifications/delete/${id}`,

  // Password reset with token
  resetPasswordWithToken: (token) => `${BASE_URL}/auth/resetPassword/${token}`,
};

// =============================================================================
// ROUTE CATEGORIES FOR EASY ACCESS
// =============================================================================

const ROUTE_CATEGORIES = {
  AUTH: {
    LOGIN: API_ROUTES.studentLogin,
    ADMIN_LOGIN: API_ROUTES.adminLogin,
    REGISTER: API_ROUTES.registerStudent,
    VERIFY_OTP: API_ROUTES.verifyOTP,
    FORGOT_PASSWORD: API_ROUTES.forgotPassword,
    RESET_PASSWORD: DYNAMIC_ROUTES.resetPasswordWithToken,
    CHECK_AUTH: API_ROUTES.checkAuth,
    GOOGLE_LOGIN: API_ROUTES.googleLogin,
  },

  STUDENT: {
    COURSES: API_ROUTES.getStudentCourses,
    COURSE_DETAILS: DYNAMIC_ROUTES.getCourseDetails,
    BOUGHT_COURSES: DYNAMIC_ROUTES.getBoughtCourses,
    CREATE_ORDER: API_ROUTES.createOrder,
    CAPTURE_PAYMENT: API_ROUTES.capturePayment,
    COURSE_PROGRESS: DYNAMIC_ROUTES.getCourseProgressByUser,
    MARK_LECTURE_VIEWED: API_ROUTES.markLectureViewed,
    DOWNLOAD_VIDEO: DYNAMIC_ROUTES.downloadCourseVideo,
  },

  INSTRUCTOR: {
    COURSES: API_ROUTES.getInstructorCourses,
    ADD_COURSE: API_ROUTES.addCourse,
    COURSE_DETAILS: DYNAMIC_ROUTES.getInstructorCourseById,
    UPDATE_COURSE: DYNAMIC_ROUTES.updateCourseById,
    COURSE_STUDENTS: DYNAMIC_ROUTES.getCourseStudentDetails,
    ANALYTICS: API_ROUTES.getInstructorAnalytics,
  },

  ADMIN: {
    COURSES: API_ROUTES.getAllCourses,
    APPROVE_COURSE: DYNAMIC_ROUTES.approveStudentCourse,
    USER_MANAGEMENT: API_ROUTES.getUserManagement,
    ANALYTICS: API_ROUTES.getAdminAnalytics,
    DASHBOARD_STATS: API_ROUTES.getAdminDashboardStats,
  },

  MEDIA: {
    UPLOAD: API_ROUTES.uploadMedia,
    BULK_UPLOAD: API_ROUTES.bulkUploadMedia,
    DELETE: DYNAMIC_ROUTES.deleteMediaById,
  },

  CHAT: {
    INSTRUCTOR_CHATS: DYNAMIC_ROUTES.getInstructorChatsById,
    STUDENT_CHATS: DYNAMIC_ROUTES.getStudentChatsById,
    CHAT_DETAILS: DYNAMIC_ROUTES.getChatDetailsById,
    SEND_MESSAGE: DYNAMIC_ROUTES.sendChatMessage,
    MARK_READ: DYNAMIC_ROUTES.markChatMessagesRead,
  },

  NEWSLETTER: {
    SUBSCRIBE: API_ROUTES.subscribeNewsletter,
    ADMIN_NEWSLETTERS: API_ROUTES.getNewsletters,
    CREATE: API_ROUTES.createNewsletter,
    UPDATE: DYNAMIC_ROUTES.updateNewsletterById,
    DELETE: DYNAMIC_ROUTES.deleteNewsletterById,
  }
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

export {
  BASE_URL,
  API_ROUTES,
  DYNAMIC_ROUTES,
  ROUTE_CATEGORIES
};

export default {
  BASE_URL,
  ROUTES: API_ROUTES,
  DYNAMIC: DYNAMIC_ROUTES,
  CATEGORIES: ROUTE_CATEGORIES
};