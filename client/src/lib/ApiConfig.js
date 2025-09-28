import axiosInstance from "@/api/axiosInstance";

/**
 * ApiConfig - Centralized API configuration for EduCore LMS
 * 
 * This module provides a structured way to manage all API endpoints
 * and HTTP operations for the EduCore Learning Management System.
 * 
 * Features:
 * - Organized by domain (auth, media, instructor, student, chat, newsletter)
 * - Standardized error handling
 * - Type safety for request/response data
 * - Progress callback support for file uploads
 * - Environment-aware base URL configuration
 */

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/v1" 
  : "/api/v1";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Standardized error handler for API calls
 * @param {Error} error - The error object from axios
 * @param {string} defaultMessage - Default error message if none available
 * @returns {Error} - Formatted error with user-friendly message
 */
const handleApiError = (error, defaultMessage) => {
  if (error.response && error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

/**
 * Generic API call wrapper with error handling
 * @param {Function} apiCall - The axios API call function
 * @param {string} errorMessage - Default error message
 * @returns {Promise} - API response data
 */
const apiWrapper = async (apiCall, errorMessage) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    return handleApiError(error, errorMessage);
  }
};

/**
 * API call wrapper with progress tracking for uploads
 * @param {Function} apiCall - The axios API call function
 * @param {Function} onProgress - Progress callback function
 * @param {string} errorMessage - Default error message
 * @returns {Promise} - API response data
 */
const apiWrapperWithProgress = async (apiCall, onProgress, errorMessage) => {
  try {
    const response = await apiCall(onProgress);
    return response.data;
  } catch (error) {
    return handleApiError(error, errorMessage);
  }
};

// =============================================================================
// API CONFIGURATION OBJECT
// =============================================================================

const ApiConfig = {
  // Base configuration
  BASE_URL,
  
  // Utility functions
  handleApiError,
  apiWrapper,
  apiWrapperWithProgress,

  // =============================================================================
  // AUTHENTICATION ENDPOINTS
  // =============================================================================
  auth: {
    /**
     * Register a new user account
     * @param {Object} formData - User registration data
     * @param {string} formData.userName - User's name
     * @param {string} formData.userEmail - User's email
     * @param {string} formData.password - User's password
     * @returns {Promise} - Registration response
     */
    register: (formData) => 
      apiWrapper(
        () => axiosInstance.post("/auth/register", { ...formData, role: "student" }),
        "Registration failed. Please try again."
      ),

    /**
     * Verify user account with OTP
     * @param {Object} formData - Verification data
     * @param {string} formData.email - User's email
     * @param {string} formData.otp - OTP code
     * @returns {Promise} - Verification response
     */
    verifyOTP: (formData) =>
      apiWrapper(
        () => axiosInstance.post("/auth/verifyUser", formData),
        "OTP verification failed. Please try again."
      ),

    /**
     * Login user
     * @param {Object} formData - Login credentials
     * @param {string} formData.userEmail - User's email
     * @param {string} formData.password - User's password
     * @returns {Promise} - Login response with token and user data
     */
    login: (formData) =>
      apiWrapper(
        () => axiosInstance.post("/auth/login", formData),
        "Login failed. Please check your credentials."
      ),

    /**
     * Check authentication status
     * @returns {Promise} - Authentication status and user data
     */
    checkAuth: () =>
      apiWrapper(
        () => axiosInstance.get("/auth/check-auth"),
        "Authentication check failed."
      ),

    /**
     * Request password reset
     * @param {string} email - User's email
     * @returns {Promise} - Password reset request response
     */
    forgotPassword: (email) =>
      apiWrapper(
        () => axiosInstance.post("/auth/forgotPassword", { email }),
        "Password reset request failed. Please try again."
      ),

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} - Password reset response
     */
    resetPassword: (token, newPassword) =>
      apiWrapper(
        () => axiosInstance.post(`/auth/resetPassword/${token}`, { password: newPassword }),
        "Password reset failed. Please try again."
      ),

    /**
     * Verify reset token validity
     * @param {string} token - Reset token
     * @returns {Promise} - Token validity response
     */
    verifyResetToken: async (token) => {
      try {
        await axiosInstance.get("/auth/check-auth", {
          headers: { "Reset-Token": token }
        });
        return { success: true };
      } catch (error) {
        return { success: false, message: "Invalid or expired token." };
      }
    }
  },

  // =============================================================================
  // MEDIA ENDPOINTS
  // =============================================================================
  media: {
    /**
     * Upload a single media file
     * @param {FormData} formData - File data to upload
     * @param {Function} onProgressCallback - Progress callback function
     * @returns {Promise} - Upload response with media URL and data
     */
    upload: (formData, onProgressCallback) =>
      apiWrapperWithProgress(
        (onProgress) => axiosInstance.post("/media/upload", formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }),
        onProgressCallback,
        "Media upload failed. Please try again."
      ),

    /**
     * Delete a media file
     * @param {string} id - Media file ID to delete
     * @returns {Promise} - Delete response
     */
    delete: (id) =>
      apiWrapper(
        () => axiosInstance.delete(`/media/delete/${id}`),
        "Media deletion failed. Please try again."
      ),

    /**
     * Bulk upload multiple media files
     * @param {FormData} formData - Multiple files data to upload
     * @param {Function} onProgressCallback - Progress callback function
     * @returns {Promise} - Bulk upload response
     */
    bulkUpload: (formData, onProgressCallback) =>
      apiWrapperWithProgress(
        (onProgress) => axiosInstance.post("/media/bulk-upload", formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }),
        onProgressCallback,
        "Bulk media upload failed. Please try again."
      )
  },

  // =============================================================================
  // INSTRUCTOR ENDPOINTS
  // =============================================================================
  instructor: {
    /**
     * Get list of courses for instructor
     * @returns {Promise} - List of instructor's courses
     */
    getCourses: () =>
      apiWrapper(
        () => axiosInstance.get("/instructor/course/get"),
        "Failed to fetch instructor courses."
      ),

    /**
     * Add a new course
     * @param {Object} formData - Course data
     * @param {string} formData.title - Course title
     * @param {string} formData.category - Course category
     * @param {string} formData.level - Course level
     * @param {string} formData.description - Course description
     * @param {number} formData.pricing - Course price
     * @param {string} formData.image - Course thumbnail URL
     * @param {Array} formData.curriculum - Course curriculum
     * @returns {Promise} - New course response
     */
    addCourse: (formData) =>
      apiWrapper(
        () => axiosInstance.post("/instructor/course/add", formData),
        "Failed to add new course."
      ),

    /**
     * Get detailed course information
     * @param {string} courseId - Course ID
     * @returns {Promise} - Detailed course data
     */
    getCourseDetails: (courseId) =>
      apiWrapper(
        () => axiosInstance.get(`/instructor/course/get/details/${courseId}`),
        "Failed to fetch course details."
      ),

    /**
     * Get students enrolled in a course
     * @param {string} courseId - Course ID
     * @returns {Promise} - List of enrolled students
     */
    getCourseStudents: (courseId) =>
      apiWrapper(
        () => axiosInstance.get(`/instructor/course/get/getStudentdetails/${courseId}`),
        "Failed to fetch course students."
      ),

    /**
     * Update course information
     * @param {string} courseId - Course ID
     * @param {Object} formData - Updated course data
     * @returns {Promise} - Update response
     */
    updateCourse: (courseId, formData) =>
      apiWrapper(
        () => axiosInstance.put(`/instructor/course/update/${courseId}`, formData),
        "Failed to update course."
      )
  },

  // =============================================================================
  // STUDENT ENDPOINTS
  // =============================================================================
  student: {
    /**
     * Get list of available courses for students
     * @param {string} query - Query parameters for filtering
     * @returns {Promise} - List of available courses
     */
    getCourses: (query = "") =>
      apiWrapper(
        () => axiosInstance.get(`/student/course/get?${query}`),
        "Failed to fetch available courses."
      ),

    /**
     * Get detailed course information for students
     * @param {string} courseId - Course ID
     * @returns {Promise} - Detailed course data
     */
    getCourseDetails: (courseId) =>
      apiWrapper(
        () => axiosInstance.get(`/student/course/get/details/${courseId}`),
        "Failed to fetch course details."
      ),

    /**
     * Check if student has purchased a course
     * @param {string} courseId - Course ID
     * @param {string} studentId - Student ID
     * @returns {Promise} - Purchase status information
     */
    checkCoursePurchase: (courseId, studentId) =>
      apiWrapper(
        () => axiosInstance.get(`/student/course/purchase-info/${courseId}/${studentId}`),
        "Failed to check course purchase status."
      ),

    /**
     * Create payment for course purchase
     * @param {Object} formData - Payment data
     * @param {string} formData.courseId - Course ID
     * @param {string} formData.studentId - Student ID
     * @param {number} formData.amount - Payment amount
     * @returns {Promise} - Payment creation response
     */
    createPayment: (formData) =>
      apiWrapper(
        () => axiosInstance.post("/student/order/create", formData),
        "Failed to create payment."
      ),

    /**
     * Capture and finalize payment
     * @param {string} paymentId - Payment ID
     * @param {string} payerId - Payer ID
     * @param {string} orderId - Order ID
     * @returns {Promise} - Payment capture response
     */
    capturePayment: (paymentId, payerId, orderId) =>
      apiWrapper(
        () => axiosInstance.post("/student/order/capture", {
          paymentId,
          payerId,
          orderId
        }),
        "Failed to capture payment."
      ),

    /**
     * Get courses purchased by student
     * @param {string} studentId - Student ID
     * @returns {Promise} - List of purchased courses
     */
    getPurchasedCourses: (studentId) =>
      apiWrapper(
        () => axiosInstance.get(`/student/courses-bought/get/${studentId}`),
        "Failed to fetch purchased courses."
      ),

    /**
     * Get current course progress for student
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @returns {Promise} - Course progress data
     */
    getCourseProgress: (userId, courseId) =>
      apiWrapper(
        () => axiosInstance.get(`/student/course-progress/get/${userId}/${courseId}`),
        "Failed to fetch course progress."
      ),

    /**
     * Mark a lecture as viewed
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @param {string} lectureId - Lecture ID
     * @returns {Promise} - Mark lecture response
     */
    markLectureViewed: (userId, courseId, lectureId) =>
      apiWrapper(
        () => axiosInstance.post("/student/course-progress/mark-lecture-viewed", {
          userId,
          courseId,
          lectureId
        }),
        "Failed to mark lecture as viewed."
      ),

    /**
     * Reset course progress
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @returns {Promise} - Reset progress response
     */
    resetCourseProgress: (userId, courseId) =>
      apiWrapper(
        () => axiosInstance.post("/student/course-progress/reset-progress", {
          userId,
          courseId
        }),
        "Failed to reset course progress."
      ),

    /**
     * Download video lecture
     * @param {string} courseId - Course ID
     * @param {string} lectureId - Lecture ID
     * @returns {Promise} - Video download response
     */
    downloadVideo: async (courseId, lectureId) => {
      try {
        const response = await axiosInstance.get(`/student/video/download/${courseId}/${lectureId}`, {
          responseType: 'blob'
        });
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = `lecture-${lectureId}.mp4`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Handle cloud-hosted videos (URL response)
        if (response.data.type === 'application/json') {
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = () => {
              try {
                const result = JSON.parse(reader.result);
                resolve(result);
              } catch (error) {
                reject(new Error("Failed to parse video download response."));
              }
            };
            reader.onerror = () => reject(new Error("Failed to read video download response."));
            reader.readAsText(response.data);
          });
        }
        
        // Handle direct file download
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: "Video download started." };
      } catch (error) {
        return handleApiError(error, "Failed to download video.");
      }
    }
  },

  // =============================================================================
  // CHAT ENDPOINTS
  // =============================================================================
  chat: {
    /**
     * Get chats for instructor
     * @param {string} instructorId - Instructor ID
     * @returns {Promise} - List of instructor chats
     */
    getInstructorChats: (instructorId) =>
      apiWrapper(
        () => axiosInstance.get(`/chat/instructor/${instructorId}`),
        "Failed to fetch instructor chats."
      ),

    /**
     * Get chats for student
     * @param {string} studentId - Student ID
     * @returns {Promise} - List of student chats
     */
    getStudentChats: (studentId) =>
      apiWrapper(
        () => axiosInstance.get(`/chat/student/${studentId}`),
        "Failed to fetch student chats."
      ),

    /**
     * Get chat by ID
     * @param {string} chatId - Chat ID
     * @returns {Promise} - Chat details and messages
     */
    getChatById: (chatId) =>
      apiWrapper(
        () => axiosInstance.get(`/chat/${chatId}`),
        "Failed to fetch chat details."
      ),

    /**
     * Get or create course chat between student and instructor
     * @param {string} courseId - Course ID
     * @param {string} studentId - Student ID
     * @param {string} userId - User ID (for context)
     * @returns {Promise} - Chat information
     */
    getOrCreateCourseChat: (courseId, studentId, userId) =>
      apiWrapper(
        () => axiosInstance.post(`/chat/course/${courseId}/student/${studentId}`, { userId }),
        "Failed to get or create course chat."
      ),

    /**
     * Send message in a chat
     * @param {string} chatId - Chat ID
     * @param {string} senderId - Sender ID
     * @param {string} content - Message content
     * @returns {Promise} - Send message response
     */
    sendMessage: (chatId, senderId, content) =>
      apiWrapper(
        () => axiosInstance.post(`/chat/${chatId}/message`, { senderId, content }),
        "Failed to send message."
      ),

    /**
     * Mark messages as read
     * @param {string} chatId - Chat ID
     * @param {string} userId - User ID
     * @returns {Promise} - Mark as read response
     */
    markMessagesAsRead: (chatId, userId) =>
      apiWrapper(
        () => axiosInstance.put(`/chat/${chatId}/read`, { userId }),
        "Failed to mark messages as read."
      )
  },

  // =============================================================================
  // NEWSLETTER ENDPOINTS
  // =============================================================================
  newsletter: {
    /**
     * Subscribe to newsletter
     * @param {string} email - Email address
     * @param {string} name - Subscriber name
     * @returns {Promise} - Subscription response
     */
    subscribe: (email, name) =>
      apiWrapper(
        () => axiosInstance.post("/newsletter/subscribe", { email, name }),
        "Failed to subscribe to newsletter."
      ),

    /**
     * Unsubscribe from newsletter
     * @param {string} email - Email address
     * @returns {Promise} - Unsubscription response
     */
    unsubscribe: (email) =>
      apiWrapper(
        () => axiosInstance.post("/newsletter/unsubscribe", { email }),
        "Failed to unsubscribe from newsletter."
      ),

    /**
     * Confirm newsletter subscription
     * @param {string} token - Confirmation token
     * @returns {Promise} - Confirmation response
     */
    confirmSubscription: (token) =>
      apiWrapper(
        () => axiosInstance.get(`/newsletter/confirm/${token}`),
        "Failed to confirm newsletter subscription."
      ),

    // Admin endpoints for newsletter management
    admin: {
      /**
       * Get all newsletters (admin)
       * @param {string} status - Filter by status (optional)
       * @returns {Promise} - List of newsletters
       */
      getNewsletters: (status = "") =>
        apiWrapper(
          () => {
            const url = status 
              ? `/newsletter/admin?status=${status}` 
              : "/newsletter/admin";
            return axiosInstance.get(url);
          },
          "Failed to fetch newsletters."
        ),

      /**
       * Get newsletter by ID (admin)
       * @param {string} id - Newsletter ID
       * @returns {Promise} - Newsletter details
       */
      getNewsletterById: (id) =>
        apiWrapper(
          () => axiosInstance.get(`/newsletter/admin/${id}`),
          "Failed to fetch newsletter."
        ),

      /**
       * Create new newsletter (admin)
       * @param {Object} formData - Newsletter data
       * @param {string} formData.title - Newsletter title
       * @param {string} formData.content - Newsletter content
       * @param {string} formData.status - Newsletter status
       * @returns {Promise} - Create newsletter response
       */
      createNewsletter: (formData) =>
        apiWrapper(
          () => axiosInstance.post("/newsletter/admin", formData),
          "Failed to create newsletter."
        ),

      /**
       * Update newsletter (admin)
       * @param {string} id - Newsletter ID
       * @param {Object} formData - Updated newsletter data
       * @returns {Promise} - Update newsletter response
       */
      updateNewsletter: (id, formData) =>
        apiWrapper(
          () => axiosInstance.put(`/newsletter/admin/${id}`, formData),
          "Failed to update newsletter."
        ),

      /**
       * Get all newsletter subscriptions (admin)
       * @returns {Promise} - List of subscribers
       */
      getSubscriptions: () =>
        apiWrapper(
          () => axiosInstance.get("/newsletter/admin/subscriptions"),
          "Failed to fetch newsletter subscriptions."
        ),

      /**
       * Delete newsletter (admin)
       * @param {string} id - Newsletter ID
       * @returns {Promise} - Delete response
       */
      deleteNewsletter: (id) =>
        apiWrapper(
          () => axiosInstance.delete(`/newsletter/admin/${id}`),
          "Failed to delete newsletter."
        )
    }
  },

  // =============================================================================
  // ADDITIONAL UTILITIES
  // =============================================================================
  
  /**
   * Generic GET request handler
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Axios config options
   * @returns {Promise} - API response
   */
  get: (endpoint, config = {}) =>
    apiWrapper(
      () => axiosInstance.get(endpoint, config),
      `Failed to fetch data from ${endpoint}.`
    ),

  /**
   * Generic POST request handler
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Axios config options
   * @returns {Promise} - API response
   */
  post: (endpoint, data = {}, config = {}) =>
    apiWrapper(
      () => axiosInstance.post(endpoint, data, config),
      `Failed to post data to ${endpoint}.`
    ),

  /**
   * Generic PUT request handler
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Axios config options
   * @returns {Promise} - API response
   */
  put: (endpoint, data = {}, config = {}) =>
    apiWrapper(
      () => axiosInstance.put(endpoint, data, config),
      `Failed to update data at ${endpoint}.`
    ),

  /**
   * Generic DELETE request handler
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Axios config options
   * @returns {Promise} - API response
   */
  delete: (endpoint, config = {}) =>
    apiWrapper(
      () => axiosInstance.delete(endpoint, config),
      `Failed to delete data at ${endpoint}.`
    ),

  /**
   * Batch API calls handler
   * @param {Array} apiCalls - Array of API call functions
   * @returns {Promise} - Array of responses
   */
  batch: async (apiCalls) => {
    try {
      const responses = await Promise.allSettled(apiCalls);
      return responses.map((response, index) => {
        if (response.status === 'fulfilled') {
          return { success: true, data: response.value };
        } else {
          return { success: false, error: response.reason.message || `API call ${index} failed` };
        }
      });
    } catch (error) {
      throw new Error("Batch API calls failed.");
    }
  },

  /**
   * Helper to build query strings from objects
   * @param {Object} params - Query parameters object
   * @returns {string} - Query string
   */
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return searchParams.toString();
  },

  /**
   * Helper to check if response indicates success
   * @param {Object} response - API response
   * @returns {boolean} - Success status
   */
  isSuccessResponse: (response) => {
    return response && (response.success === true || response.status === 'success');
  },

  /**
   * Helper to extract error message from response
   * @param {Object} response - API response
   * @returns {string} - Error message
   */
  getErrorMessage: (response) => {
    if (response?.message) return response.message;
    if (response?.error) return response.error;
    if (response?.data?.message) return response.data.message;
    return "An unexpected error occurred.";
  }
};

// =============================================================================
// EXPORT
// =============================================================================

export default ApiConfig;