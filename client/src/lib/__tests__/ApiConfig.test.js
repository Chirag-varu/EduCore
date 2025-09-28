/**
 * Unit Tests for ApiConfig
 * 
 * Tests for the centralized API configuration system including:
 * - Utility functions
 * - Error handling
 * - Response processing
 * - Batch operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ApiConfig from '../ApiConfig';
import axiosInstance from '@/api/axiosInstance';

// Mock axios instance
vi.mock('@/api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ApiConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base Configuration', () => {
    it('should have correct base URL for development', () => {
      expect(ApiConfig.BASE_URL).toBe('http://localhost:5000/api/v1');
    });

    it('should export all required utility functions', () => {
      expect(typeof ApiConfig.handleApiError).toBe('function');
      expect(typeof ApiConfig.apiWrapper).toBe('function');
      expect(typeof ApiConfig.apiWrapperWithProgress).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors with custom message', () => {
      const error = {
        response: {
          data: {
            message: 'Custom error message'
          }
        }
      };

      expect(() => {
        ApiConfig.handleApiError(error, 'Default message');
      }).toThrow('Custom error message');
    });

    it('should use default message when no custom message available', () => {
      const error = {};

      expect(() => {
        ApiConfig.handleApiError(error, 'Default message');
      }).toThrow('Default message');
    });
  });

  describe('API Wrapper Functions', () => {
    it('should wrap API calls and return data on success', async () => {
      const mockResponse = { data: { success: true, data: 'test data' } };
      const mockApiCall = vi.fn().mockResolvedValue(mockResponse);

      const result = await ApiConfig.apiWrapper(mockApiCall, 'Error message');

      expect(mockApiCall).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API call failures', async () => {
      const mockError = {
        response: {
          data: {
            message: 'API call failed'
          }
        }
      };
      const mockApiCall = vi.fn().mockRejectedValue(mockError);

      await expect(
        ApiConfig.apiWrapper(mockApiCall, 'Default error')
      ).rejects.toThrow('API call failed');
    });

    it('should handle progress tracking for uploads', async () => {
      const mockResponse = { data: { success: true } };
      const mockProgressCallback = vi.fn();
      const mockApiCall = vi.fn().mockImplementation((onProgress) => {
        onProgress(50);
        return Promise.resolve(mockResponse);
      });

      const result = await ApiConfig.apiWrapperWithProgress(
        mockApiCall,
        mockProgressCallback,
        'Upload error'
      );

      expect(mockProgressCallback).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Authentication Endpoints', () => {
    it('should call register endpoint with correct data', async () => {
      const formData = {
        userName: 'Test User',
        userEmail: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = { data: { success: true } };
      
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await ApiConfig.auth.register(formData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        ...formData,
        role: 'student'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call login endpoint with credentials', async () => {
      const credentials = {
        userEmail: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = { data: { success: true, token: 'mock-token' } };
      
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await ApiConfig.auth.login(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should verify reset token correctly', async () => {
      const token = 'reset-token-123';
      const mockResponse = { data: { success: true } };
      
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await ApiConfig.auth.verifyResetToken(token);

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/check-auth', {
        headers: { 'Reset-Token': token }
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle reset token verification failure', async () => {
      const token = 'invalid-token';
      
      axiosInstance.get.mockRejectedValue(new Error('Invalid token'));

      const result = await ApiConfig.auth.verifyResetToken(token);

      expect(result).toEqual({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    });
  });

  describe('Media Endpoints', () => {
    it('should handle file upload with progress', async () => {
      const formData = new FormData();
      formData.append('file', 'mock-file');
      const mockProgress = vi.fn();
      const mockResponse = { data: { success: true, url: 'upload-url' } };

      axiosInstance.post.mockImplementation((url, data, config) => {
        // Simulate progress callback
        config.onUploadProgress({ loaded: 50, total: 100 });
        return Promise.resolve(mockResponse);
      });

      const result = await ApiConfig.media.upload(formData, mockProgress);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/media/upload',
        formData,
        expect.objectContaining({
          onUploadProgress: expect.any(Function)
        })
      );
      expect(mockProgress).toHaveBeenCalledWith(50);
    });
  });

  describe('Utility Functions', () => {
    describe('buildQueryString', () => {
      it('should build query string from object', () => {
        const params = {
          category: 'programming',
          level: 'beginner',
          page: 1
        };

        const queryString = ApiConfig.buildQueryString(params);

        expect(queryString).toBe('category=programming&level=beginner&page=1');
      });

      it('should ignore null and undefined values', () => {
        const params = {
          category: 'programming',
          level: null,
          instructor: undefined,
          search: ''
        };

        const queryString = ApiConfig.buildQueryString(params);

        expect(queryString).toBe('category=programming');
      });
    });

    describe('isSuccessResponse', () => {
      it('should identify successful responses', () => {
        expect(ApiConfig.isSuccessResponse({ success: true })).toBe(true);
        expect(ApiConfig.isSuccessResponse({ status: 'success' })).toBe(true);
        expect(ApiConfig.isSuccessResponse({ success: false })).toBe(false);
        expect(ApiConfig.isSuccessResponse({ status: 'error' })).toBe(false);
        expect(ApiConfig.isSuccessResponse({})).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should extract error messages from different response formats', () => {
        expect(ApiConfig.getErrorMessage({ message: 'Direct message' }))
          .toBe('Direct message');
        
        expect(ApiConfig.getErrorMessage({ error: 'Error property' }))
          .toBe('Error property');
        
        expect(ApiConfig.getErrorMessage({ data: { message: 'Nested message' } }))
          .toBe('Nested message');
        
        expect(ApiConfig.getErrorMessage({}))
          .toBe('An unexpected error occurred.');
      });
    });

    describe('batch', () => {
      it('should execute multiple API calls and return results', async () => {
        const apiCall1 = vi.fn().mockResolvedValue('result1');
        const apiCall2 = vi.fn().mockResolvedValue('result2');
        const apiCall3 = vi.fn().mockRejectedValue(new Error('Call 3 failed'));

        const results = await ApiConfig.batch([apiCall1, apiCall2, apiCall3]);

        expect(results).toHaveLength(3);
        expect(results[0]).toEqual({ success: true, data: 'result1' });
        expect(results[1]).toEqual({ success: true, data: 'result2' });
        expect(results[2]).toEqual({ 
          success: false, 
          error: 'Call 3 failed' 
        });
      });

      it('should handle empty batch calls', async () => {
        const results = await ApiConfig.batch([]);
        expect(results).toEqual([]);
      });
    });
  });

  describe('Student Endpoints', () => {
    it('should get courses with query parameters', async () => {
      const query = 'category=programming&level=beginner';
      const mockResponse = { data: { courses: [] } };
      
      axiosInstance.get.mockResolvedValue(mockResponse);

      await ApiConfig.student.getCourses(query);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/student/course/get?${query}`);
    });

    it('should handle video download', async () => {
      const courseId = 'course-123';
      const lectureId = 'lecture-456';
      
      // Mock successful blob response
      const mockResponse = {
        data: new Blob(['video-data']),
        headers: {
          'content-disposition': 'attachment; filename="lecture-video.mp4"'
        }
      };
      
      axiosInstance.get.mockResolvedValue(mockResponse);

      // Mock DOM methods
      const mockLink = {
        click: vi.fn(),
        remove: vi.fn()
      };
      const mockCreateElement = vi.fn().mockReturnValue(mockLink);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob-url');
      const mockRevokeObjectURL = vi.fn();

      global.document = {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        }
      };
      global.window = {
        URL: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL
        }
      };

      const result = await ApiConfig.student.downloadVideo(courseId, lectureId);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/student/video/download/${courseId}/${lectureId}`,
        { responseType: 'blob' }
      );
      expect(result).toEqual({ 
        success: true, 
        message: 'Video download started.' 
      });
    });
  });

  describe('Generic HTTP Methods', () => {
    it('should handle GET requests', async () => {
      const endpoint = '/test/endpoint';
      const mockResponse = { data: { success: true } };
      
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await ApiConfig.get(endpoint);

      expect(axiosInstance.get).toHaveBeenCalledWith(endpoint, {});
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle POST requests with data', async () => {
      const endpoint = '/test/endpoint';
      const data = { test: 'data' };
      const mockResponse = { data: { success: true } };
      
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await ApiConfig.post(endpoint, data);

      expect(axiosInstance.post).toHaveBeenCalledWith(endpoint, data, {});
      expect(result).toEqual(mockResponse.data);
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('ApiConfig Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete authentication flow', async () => {
    // Mock register response
    const registerResponse = { data: { success: true, message: 'User registered' } };
    axiosInstance.post.mockResolvedValueOnce(registerResponse);

    // Mock OTP verification response
    const otpResponse = { data: { success: true, message: 'OTP verified' } };
    axiosInstance.post.mockResolvedValueOnce(otpResponse);

    // Mock login response
    const loginResponse = { 
      data: { 
        success: true, 
        data: { 
          user: { id: '1', email: 'test@example.com' },
          accessToken: 'token123'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(loginResponse);

    // Execute complete flow
    const registerResult = await ApiConfig.auth.register({
      userName: 'Test User',
      userEmail: 'test@example.com',
      password: 'password123'
    });

    const otpResult = await ApiConfig.auth.verifyOTP({
      email: 'test@example.com',
      otp: '123456'
    });

    const loginResult = await ApiConfig.auth.login({
      userEmail: 'test@example.com',
      password: 'password123'
    });

    expect(registerResult.success).toBe(true);
    expect(otpResult.success).toBe(true);
    expect(loginResult.success).toBe(true);
    expect(loginResult.data.accessToken).toBe('token123');
  });

  it('should handle course creation and enrollment flow', async () => {
    // Mock course creation
    const courseResponse = { 
      data: { 
        success: true, 
        data: { 
          _id: 'course-123',
          title: 'Test Course'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(courseResponse);

    // Mock course enrollment
    const enrollmentResponse = { 
      data: { 
        success: true,
        data: {
          orderId: 'order-123'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(enrollmentResponse);

    // Execute flow
    const courseResult = await ApiConfig.instructor.addCourse({
      title: 'Test Course',
      category: 'programming',
      level: 'beginner',
      description: 'Test description',
      pricing: 99
    });

    const enrollmentResult = await ApiConfig.student.createPayment({
      courseId: 'course-123',
      studentId: 'student-123',
      amount: 99
    });

    expect(courseResult.success).toBe(true);
    expect(enrollmentResult.success).toBe(true);
  });
});