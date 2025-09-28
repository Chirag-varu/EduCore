/**
 * ApiConfig Usage Examples
 * 
 * This file demonstrates how to use the centralized ApiConfig for API calls
 * in the EduCore LMS application.
 */

import ApiConfig from './ApiConfig';

// =============================================================================
// AUTHENTICATION EXAMPLES
// =============================================================================

// User registration
const registerUser = async (userData) => {
  try {
    const response = await ApiConfig.auth.register(userData);
    console.log('Registration successful:', response);
    return response;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};

// User login
const loginUser = async (credentials) => {
  try {
    const response = await ApiConfig.auth.login(credentials);
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// =============================================================================
// INSTRUCTOR EXAMPLES
// =============================================================================

// Fetch instructor courses
const getInstructorCourses = async () => {
  try {
    const response = await ApiConfig.instructor.getCourses();
    console.log('Courses fetched:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch courses:', error.message);
    throw error;
  }
};

// Add new course
const addNewCourse = async (courseData) => {
  try {
    const response = await ApiConfig.instructor.addCourse(courseData);
    console.log('Course added:', response);
    return response;
  } catch (error) {
    console.error('Failed to add course:', error.message);
    throw error;
  }
};

// =============================================================================
// STUDENT EXAMPLES
// =============================================================================

// Fetch available courses with filtering
const getAvailableCourses = async (filters = {}) => {
  try {
    const queryString = ApiConfig.buildQueryString(filters);
    const response = await ApiConfig.student.getCourses(queryString);
    console.log('Available courses:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch courses:', error.message);
    throw error;
  }
};

// Purchase a course
const purchaseCourse = async (courseId, studentId, amount) => {
  try {
    // First create payment
    const paymentData = { courseId, studentId, amount };
    const paymentResponse = await ApiConfig.student.createPayment(paymentData);
    
    console.log('Payment created:', paymentResponse);
    return paymentResponse;
  } catch (error) {
    console.error('Failed to create payment:', error.message);
    throw error;
  }
};

// =============================================================================
// MEDIA EXAMPLES
// =============================================================================

// Upload media with progress tracking
const uploadMedia = async (fileData) => {
  try {
    const response = await ApiConfig.media.upload(fileData, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    console.log('Media uploaded:', response);
    return response;
  } catch (error) {
    console.error('Failed to upload media:', error.message);
    throw error;
  }
};

// =============================================================================
// CHAT EXAMPLES
// =============================================================================

// Send a message
const sendChatMessage = async (chatId, senderId, message) => {
  try {
    const response = await ApiConfig.chat.sendMessage(chatId, senderId, message);
    console.log('Message sent:', response);
    return response;
  } catch (error) {
    console.error('Failed to send message:', error.message);
    throw error;
  }
};

// =============================================================================
// NEWSLETTER EXAMPLES
// =============================================================================

// Subscribe to newsletter
const subscribeToNewsletter = async (email, name) => {
  try {
    const response = await ApiConfig.newsletter.subscribe(email, name);
    console.log('Newsletter subscription successful:', response);
    return response;
  } catch (error) {
    console.error('Newsletter subscription failed:', error.message);
    throw error;
  }
};

// Admin: Get all newsletters
const getNewsletters = async (status = '') => {
  try {
    const response = await ApiConfig.newsletter.admin.getNewsletters(status);
    console.log('Newsletters fetched:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch newsletters:', error.message);
    throw error;
  }
};

// =============================================================================
// BATCH OPERATIONS EXAMPLE
// =============================================================================

// Execute multiple API calls simultaneously
const loadDashboardData = async (userId) => {
  try {
    const apiCalls = [
      ApiConfig.student.getPurchasedCourses(userId),
      ApiConfig.chat.getStudentChats(userId),
      ApiConfig.auth.checkAuth()
    ];
    
    const responses = await ApiConfig.batch(apiCalls);
    
    responses.forEach((response, index) => {
      if (response.success) {
        console.log(`API call ${index} successful:`, response.data);
      } else {
        console.error(`API call ${index} failed:`, response.error);
      }
    });
    
    return responses;
  } catch (error) {
    console.error('Batch operations failed:', error.message);
    throw error;
  }
};

// =============================================================================
// GENERIC API EXAMPLES
// =============================================================================

// Using generic methods for custom endpoints
const customApiCall = async () => {
  try {
    // Custom GET request
    const response = await ApiConfig.get('/custom/endpoint');
    
    // Check if response is successful
    if (ApiConfig.isSuccessResponse(response)) {
      console.log('Custom API call successful:', response);
    } else {
      console.error('API call failed:', ApiConfig.getErrorMessage(response));
    }
    
    return response;
  } catch (error) {
    console.error('Custom API call failed:', error.message);
    throw error;
  }
};

// =============================================================================
// EXPORTS FOR TESTING/DEMO
// =============================================================================

export {
  registerUser,
  loginUser,
  getInstructorCourses,
  addNewCourse,
  getAvailableCourses,
  purchaseCourse,
  uploadMedia,
  sendChatMessage,
  subscribeToNewsletter,
  getNewsletters,
  loadDashboardData,
  customApiCall
};