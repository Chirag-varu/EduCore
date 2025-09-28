/**
 * API Endpoints Constants for EduCore LMS
 * 
 * Centralized location for all API endpoint paths to avoid hardcoded strings
 * and enable easier maintenance and consistency across the application.
 */

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

export const API_BASE_URL = {
  DEVELOPMENT: "http://localhost:5000/api/v1",
  PRODUCTION: "/api/v1"
};

export const API_VERSION = "v1";

// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  VERIFY_OTP: "/auth/verifyUser", 
  LOGIN: "/auth/login",
  CHECK_AUTH: "/auth/check-auth",
  FORGOT_PASSWORD: "/auth/forgotPassword",
  RESET_PASSWORD: (token) => `/auth/resetPassword/${token}`,
  LOGOUT: "/auth/logout"
};

// =============================================================================
// MEDIA ENDPOINTS
// =============================================================================

export const MEDIA_ENDPOINTS = {
  UPLOAD: "/media/upload",
  BULK_UPLOAD: "/media/bulk-upload",
  DELETE: (id) => `/media/delete/${id}`,
  GET_BY_ID: (id) => `/media/${id}`
};

// =============================================================================
// INSTRUCTOR ENDPOINTS
// =============================================================================

export const INSTRUCTOR_ENDPOINTS = {
  // Course management
  GET_COURSES: "/instructor/course/get",
  ADD_COURSE: "/instructor/course/add",
  GET_COURSE_DETAILS: (id) => `/instructor/course/get/details/${id}`,
  GET_COURSE_STUDENTS: (id) => `/instructor/course/get/getStudentdetails/${id}`,
  UPDATE_COURSE: (id) => `/instructor/course/update/${id}`,
  DELETE_COURSE: (id) => `/instructor/course/delete/${id}`,
  PUBLISH_COURSE: (id) => `/instructor/course/publish/${id}`,
  UNPUBLISH_COURSE: (id) => `/instructor/course/unpublish/${id}`,
  
  // Analytics
  GET_ANALYTICS: "/instructor/analytics",
  GET_COURSE_ANALYTICS: (id) => `/instructor/analytics/course/${id}`
};

// =============================================================================
// STUDENT ENDPOINTS
// =============================================================================

export const STUDENT_ENDPOINTS = {
  // Course browsing
  GET_COURSES: "/student/course/get",
  GET_COURSE_DETAILS: (id) => `/student/course/get/details/${id}`,
  SEARCH_COURSES: "/student/course/search",
  GET_COURSE_BY_CATEGORY: (category) => `/student/course/category/${category}`,
  
  // Course purchasing
  CHECK_PURCHASE_INFO: (courseId, studentId) => `/student/course/purchase-info/${courseId}/${studentId}`,
  GET_PURCHASED_COURSES: (studentId) => `/student/courses-bought/get/${studentId}`,
  
  // Orders and payments
  CREATE_ORDER: "/student/order/create",
  CAPTURE_PAYMENT: "/student/order/capture",
  GET_ORDER_HISTORY: (studentId) => `/student/order/history/${studentId}`,
  
  // Course progress
  GET_COURSE_PROGRESS: (userId, courseId) => `/student/course-progress/get/${userId}/${courseId}`,
  MARK_LECTURE_VIEWED: "/student/course-progress/mark-lecture-viewed",
  RESET_COURSE_PROGRESS: "/student/course-progress/reset-progress",
  
  // Video downloads
  DOWNLOAD_VIDEO: (courseId, lectureId) => `/student/video/download/${courseId}/${lectureId}`,
  
  // Comments and reviews
  ADD_COMMENT: "/student/comment/add",
  GET_COMMENTS: (courseId) => `/student/comment/${courseId}`,
  UPDATE_COMMENT: (id) => `/student/comment/update/${id}`,
  DELETE_COMMENT: (id) => `/student/comment/delete/${id}`
};

// =============================================================================
// CHAT ENDPOINTS
// =============================================================================

export const CHAT_ENDPOINTS = {
  // Get chats
  GET_INSTRUCTOR_CHATS: (instructorId) => `/chat/instructor/${instructorId}`,
  GET_STUDENT_CHATS: (studentId) => `/chat/student/${studentId}`,
  GET_CHAT_BY_ID: (chatId) => `/chat/${chatId}`,
  
  // Chat management
  GET_OR_CREATE_COURSE_CHAT: (courseId, studentId) => `/chat/course/${courseId}/student/${studentId}`,
  DELETE_CHAT: (chatId) => `/chat/${chatId}`,
  
  // Messages
  SEND_MESSAGE: (chatId) => `/chat/${chatId}/message`,
  MARK_MESSAGES_READ: (chatId) => `/chat/${chatId}/read`,
  DELETE_MESSAGE: (chatId, messageId) => `/chat/${chatId}/message/${messageId}`,
  EDIT_MESSAGE: (chatId, messageId) => `/chat/${chatId}/message/${messageId}/edit`
};

// =============================================================================
// NEWSLETTER ENDPOINTS
// =============================================================================

export const NEWSLETTER_ENDPOINTS = {
  // Public endpoints
  SUBSCRIBE: "/newsletter/subscribe",
  UNSUBSCRIBE: "/newsletter/unsubscribe",
  CONFIRM_SUBSCRIPTION: (token) => `/newsletter/confirm/${token}`,
  
  // Admin endpoints
  ADMIN: {
    GET_NEWSLETTERS: "/newsletter/admin",
    GET_NEWSLETTER_BY_ID: (id) => `/newsletter/admin/${id}`,
    CREATE_NEWSLETTER: "/newsletter/admin",
    UPDATE_NEWSLETTER: (id) => `/newsletter/admin/${id}`,
    DELETE_NEWSLETTER: (id) => `/newsletter/admin/${id}`,
    GET_SUBSCRIPTIONS: "/newsletter/admin/subscriptions",
    GET_ANALYTICS: "/newsletter/admin/analytics",
    SEND_NEWSLETTER: (id) => `/newsletter/admin/${id}/send`,
    SCHEDULE_NEWSLETTER: (id) => `/newsletter/admin/${id}/schedule`
  }
};

// =============================================================================
// HTTP METHODS
// =============================================================================

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH"
};

// =============================================================================
// RESPONSE STATUS CODES
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// =============================================================================
// REQUEST TIMEOUT CONFIGURATIONS
// =============================================================================

export const TIMEOUT_CONFIG = {
  DEFAULT: 10000, // 10 seconds
  FILE_UPLOAD: 300000, // 5 minutes
  DOWNLOAD: 600000, // 10 minutes
  AUTHENTICATION: 5000, // 5 seconds
  QUICK_ACTIONS: 3000 // 3 seconds
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access forbidden. Insufficient permissions.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again."
};

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTER_SUCCESS: "Registration successful!",
  COURSE_CREATED: "Course created successfully!",
  COURSE_UPDATED: "Course updated successfully!",
  COURSE_DELETED: "Course deleted successfully!",
  PAYMENT_SUCCESS: "Payment completed successfully!",
  MESSAGE_SENT: "Message sent successfully!",
  FILE_UPLOADED: "File uploaded successfully!",
  PROGRESS_SAVED: "Progress saved successfully!"
};

// =============================================================================
// EXPORT ALL CONSTANTS
// =============================================================================

export const API_CONSTANTS = {
  BASE_URL: API_BASE_URL,
  VERSION: API_VERSION,
  ENDPOINTS: {
    AUTH: AUTH_ENDPOINTS,
    MEDIA: MEDIA_ENDPOINTS,
    INSTRUCTOR: INSTRUCTOR_ENDPOINTS,
    STUDENT: STUDENT_ENDPOINTS,
    CHAT: CHAT_ENDPOINTS,
    NEWSLETTER: NEWSLETTER_ENDPOINTS
  },
  HTTP: {
    METHODS: HTTP_METHODS,
    STATUS: HTTP_STATUS,
    TIMEOUT: TIMEOUT_CONFIG
  },
  MESSAGES: {
    ERROR: ERROR_MESSAGES,
    SUCCESS: SUCCESS_MESSAGES
  }
};

export default API_CONSTANTS;