import { sanitizeInput, validateRequestSize, validateFields } from '../middleware/input-validation.js';

// Mock Express req, res, next
const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Security Middleware Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    test('should sanitize HTML in request body', () => {
      const req = mockRequest({
        title: '<script>alert("xss")</script>Safe Title',
        description: 'Normal description'
      });
      const res = mockResponse();

      sanitizeInput(req, res, mockNext);

      expect(req.body.title).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;Safe Title');
      expect(req.body.description).toBe('Normal description');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should trim whitespace from strings', () => {
      const req = mockRequest({
        username: '  testuser  ',
        email: '  test@example.com  '
      });
      const res = mockResponse();

      sanitizeInput(req, res, mockNext);

      expect(req.body.username).toBe('testuser');
      expect(req.body.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should sanitize nested objects', () => {
      const req = mockRequest({
        user: {
          name: '<b>John</b>',
          profile: {
            bio: '<script>evil</script>Nice person'
          }
        }
      });
      const res = mockResponse();

      sanitizeInput(req, res, mockNext);

      expect(req.body.user.name).toBe('&lt;b&gt;John&lt;&#x2F;b&gt;');
      expect(req.body.user.profile.bio).toBe('&lt;script&gt;evil&lt;&#x2F;script&gt;Nice person');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Field Validation', () => {
    test('should validate required fields', () => {
      const validationRules = {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 }
      };

      const req = mockRequest({
        email: '',
        password: 'short'
      });
      const res = mockResponse();

      const validator = validateFields(validationRules);
      validator(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'email is required',
          'password must be at least 8 characters long'
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should pass validation with valid data', () => {
      const validationRules = {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 }
      };

      const req = mockRequest({
        email: 'test@example.com',
        password: 'validpassword123'
      });
      const res = mockResponse();

      const validator = validateFields(validationRules);
      validator(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should validate email format', () => {
      const validationRules = {
        email: { required: true, email: true }
      };

      const req = mockRequest({
        email: 'invalid-email-format'
      });
      const res = mockResponse();

      const validator = validateFields(validationRules);
      validator(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['email must be a valid email address']
      });
    });

    test('should validate enum values', () => {
      const validationRules = {
        role: { required: true, enum: ['student', 'instructor', 'admin'] }
      };

      const req = mockRequest({
        role: 'invalid_role'
      });
      const res = mockResponse();

      const validator = validateFields(validationRules);
      validator(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['role must be one of: student, instructor, admin']
      });
    });
  });

  describe('Request Size Validation', () => {
    test('should reject oversized requests', () => {
      const req = {
        get: jest.fn().mockReturnValue('20971520') // 20MB in bytes
      };
      const res = mockResponse();

      validateRequestSize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Request entity too large. Maximum size is 10MB.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow normal sized requests', () => {
      const req = {
        get: jest.fn().mockReturnValue('1048576') // 1MB in bytes
      };
      const res = mockResponse();

      validateRequestSize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow requests without content-length header', () => {
      const req = {
        get: jest.fn().mockReturnValue(undefined)
      };
      const res = mockResponse();

      validateRequestSize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});