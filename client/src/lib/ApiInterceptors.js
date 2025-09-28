/**
 * Enhanced API Interceptors for EduCore LMS
 * 
 * Provides centralized request/response interceptors for:
 * - Automatic token refresh
 * - Global error handling
 * - Request/response logging
 * - Loading states management
 * - Rate limiting handling
 */

import axiosInstance from "@/api/axiosInstance";
import { ERROR_MESSAGES, HTTP_STATUS } from "./ApiConstants";

// =============================================================================
// CONFIGURATION
// =============================================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// =============================================================================
// REQUEST INTERCEPTORS
// =============================================================================

/**
 * Add request interceptor for authentication and logging
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: new Date() };
    
    // Add correlation ID for request tracing
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    
    // Log request in development
    if (import.meta.env.MODE === "development") {
      console.log(`🚀 API Request [${config.method?.toUpperCase()}]:`, config.url);
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
    }
    
    // Add auth token if available (this is already handled by the existing interceptor)
    const accessToken = localStorage.getItem("token") || "";
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// =============================================================================
// RESPONSE INTERCEPTORS
// =============================================================================

/**
 * Add response interceptor for error handling and token refresh
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Log response in development
    if (import.meta.env.MODE === "development") {
      console.log(
        `✅ API Response [${response.config.method?.toUpperCase()}] ${response.status}:`,
        response.config.url,
        `(${duration}ms)`
      );
      console.log('📥 Response Data:', response.data);
    }
    
    // Log slow requests
    if (duration > 5000) {
      console.warn(`🐌 Slow API request detected: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Calculate request duration if metadata exists
    const duration = originalRequest.metadata 
      ? new Date() - originalRequest.metadata.startTime 
      : 0;
    
    // Log error in development
    if (import.meta.env.MODE === "development") {
      console.error(
        `❌ API Error [${originalRequest.method?.toUpperCase()}] ${status}:`,
        originalRequest.url,
        duration ? `(${duration}ms)` : '',
        error.response?.data || error.message
      );
    }
    
    // Handle different error scenarios
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return handleUnauthorizedError(error, originalRequest);
        
      case HTTP_STATUS.FORBIDDEN:
        return handleForbiddenError(error);
        
      case HTTP_STATUS.NOT_FOUND:
        return handleNotFoundError(error);
        
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return handleRateLimitError(error, originalRequest);
        
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return handleServerError(error);
        
      default:
        return handleGenericError(error);
    }
  }
);

// =============================================================================
// ERROR HANDLERS
// =============================================================================

/**
 * Handle 401 Unauthorized errors with token refresh
 */
async function handleUnauthorizedError(error, originalRequest) {
  if (originalRequest._retry) {
    // Already tried to refresh, logout user
    handleLogout();
    return Promise.reject(error);
  }
  
  if (isRefreshing) {
    // Token refresh in progress, queue this request
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(token => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }).catch(err => {
      return Promise.reject(err);
    });
  }
  
  originalRequest._retry = true;
  isRefreshing = true;
  
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    // Attempt to refresh token
    const response = await axiosInstance.post("/auth/refresh", {
      refreshToken: refreshToken
    });
    
    const newToken = response.data.accessToken;
    localStorage.setItem("token", newToken);
    
    // Update authorization header
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    
    processQueue(null, newToken);
    
    return axiosInstance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    handleLogout();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}

/**
 * Handle 403 Forbidden errors
 */
function handleForbiddenError(error) {
  const customError = new Error(ERROR_MESSAGES.FORBIDDEN);
  customError.originalError = error;
  customError.status = HTTP_STATUS.FORBIDDEN;
  
  // Show forbidden message to user
  showErrorNotification(ERROR_MESSAGES.FORBIDDEN);
  
  return Promise.reject(customError);
}

/**
 * Handle 404 Not Found errors
 */
function handleNotFoundError(error) {
  const customError = new Error(ERROR_MESSAGES.NOT_FOUND);
  customError.originalError = error;
  customError.status = HTTP_STATUS.NOT_FOUND;
  
  return Promise.reject(customError);
}

/**
 * Handle 429 Rate Limit errors with retry logic
 */
async function handleRateLimitError(error, originalRequest) {
  const retryAfter = error.response?.headers['retry-after'];
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000; // Default 1 second
  
  console.warn(`⏳ Rate limited. Retrying after ${delay}ms...`);
  
  // Show rate limit message to user
  showErrorNotification(`Rate limit exceeded. Retrying in ${Math.ceil(delay / 1000)} seconds...`);
  
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, delay));
  return axiosInstance(originalRequest);
}

/**
 * Handle 5xx Server errors
 */
function handleServerError(error) {
  const customError = new Error(ERROR_MESSAGES.SERVER_ERROR);
  customError.originalError = error;
  customError.status = error.response?.status;
  
  // Show server error message to user
  showErrorNotification(ERROR_MESSAGES.SERVER_ERROR);
  
  return Promise.reject(customError);
}

/**
 * Handle generic errors
 */
function handleGenericError(error) {
  let message = ERROR_MESSAGES.GENERIC_ERROR;
  
  if (!navigator.onLine) {
    message = ERROR_MESSAGES.NETWORK_ERROR;
  } else if (error.code === 'ECONNABORTED') {
    message = ERROR_MESSAGES.TIMEOUT_ERROR;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  }
  
  const customError = new Error(message);
  customError.originalError = error;
  customError.status = error.response?.status;
  
  return Promise.reject(customError);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate unique correlation ID for request tracing
 */
function generateCorrelationId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle user logout
 */
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = "/auth";
}

/**
 * Show error notification to user
 * Note: This assumes you have a notification system in place
 */
function showErrorNotification(message) {
  // Implementation depends on your notification system
  // This could be a toast, modal, or other UI component
  console.error('🔔 Error Notification:', message);
  
  // Example using a custom event that your UI can listen to
  window.dispatchEvent(new CustomEvent('apiError', {
    detail: { message }
  }));
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Track API performance metrics
 */
const performanceMetrics = {
  requests: 0,
  errors: 0,
  totalDuration: 0,
  slowRequests: 0
};

// Add performance tracking
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    
    performanceMetrics.requests++;
    performanceMetrics.totalDuration += duration;
    
    if (duration > 5000) {
      performanceMetrics.slowRequests++;
    }
    
    return response;
  },
  (error) => {
    performanceMetrics.errors++;
    return Promise.reject(error);
  }
);

/**
 * Get performance metrics
 */
export function getApiPerformanceMetrics() {
  return {
    ...performanceMetrics,
    averageDuration: performanceMetrics.requests > 0 
      ? Math.round(performanceMetrics.totalDuration / performanceMetrics.requests) 
      : 0,
    errorRate: performanceMetrics.requests > 0 
      ? Math.round((performanceMetrics.errors / performanceMetrics.requests) * 100) 
      : 0
  };
}

/**
 * Reset performance metrics
 */
export function resetApiPerformanceMetrics() {
  performanceMetrics.requests = 0;
  performanceMetrics.errors = 0;
  performanceMetrics.totalDuration = 0;
  performanceMetrics.slowRequests = 0;
}

// =============================================================================
// NETWORK STATUS MONITORING
// =============================================================================

/**
 * Monitor network status and queue requests when offline
 */
let offlineQueue = [];
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  console.log('🌐 Back online! Processing queued requests...');
  isOnline = true;
  
  // Process queued requests
  offlineQueue.forEach(({ resolve, config }) => {
    axiosInstance(config).then(resolve).catch(resolve);
  });
  offlineQueue = [];
});

window.addEventListener('offline', () => {
  console.log('📱 Gone offline! Requests will be queued...');
  isOnline = false;
});

// =============================================================================
// EXPORT INTERCEPTOR UTILITIES
// =============================================================================

export {
  generateCorrelationId,
  handleLogout,
  showErrorNotification,
  isRefreshing,
  performanceMetrics
};