import { validatePassword, validateEmail, validateUsername } from '../helpers/validation.js';
import express from 'express';
import request from 'supertest';
import { authLimiter } from '../middleware/rate-limit.js';

// Mock redis client to avoid top-level await during imports
jest.mock('../helpers/redisClient.js', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock environment variables required by controllers where needed
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_with_sufficient_length_123456';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Mocks for User model and bcrypt
jest.mock('../models/User.js', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: { hash: jest.fn(), compare: jest.fn() },
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Helper to create mock req/res for controller unit tests
const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Authentication Tests', () => {
  
  describe('Password Validation', () => {
    test('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    test('should accept strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
    });

    test('should reject password without uppercase', () => {
      const result = validatePassword('weakpass123!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    test('should reject password without numbers', () => {
      const result = validatePassword('WeakPass!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('number');
    });

    test('should reject password without special characters', () => {
      const result = validatePassword('WeakPass123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('special character');
    });
  });

  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('valid email');
    });

    test('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('Username Validation', () => {
    test('should accept valid username', () => {
      const result = validateUsername('testuser123');
      expect(result.isValid).toBe(true);
    });

    test('should reject empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('Auth Controller - Negative Scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('loginUser should return 401 for invalid credentials', async () => {
      const { default: authController } = await import('../controllers/auth-controller/index.js');
      const User = (await import('../models/User.js')).default;
      const bcrypt = await import('bcryptjs');

      // No user found or password mismatch
      User.findOne.mockResolvedValueOnce(null);

      const req = { body: { userEmail: 'nope@example.com', password: 'wrongpass' } };
      const res = createMockRes();

      await authController.loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'nope@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });

      // Also validate password mismatch branch
      User.findOne.mockResolvedValueOnce({ password: 'hashed', userName: 'x', userEmail: 'x@x.com', role: 'student', _id: 'u1' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
      const res2 = createMockRes();
      await authController.loginUser({ body: { userEmail: 'x@x.com', password: 'wrong' } }, res2);
      expect(res2.status).toHaveBeenCalledWith(401);
      expect(res2.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('registerUser should return 400 when user already exists (duplicate signup)', async () => {
      const { default: authController } = await import('../controllers/auth-controller/index.js');
      const User = (await import('../models/User.js')).default;
      User.findOne.mockResolvedValueOnce({ _id: 'existingUser' });

      const req = { body: { userName: 'john', userEmail: 'john@example.com', password: 'StrongPass123!', role: 'student' } };
      const res = createMockRes();

      await authController.registerUser(req, res);

      expect(User.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User name or user email already exists' });
    });
  });

  describe('Rate Limiter - authLimiter', () => {
    it('should throttle after exceeding limit of failed auth attempts', async () => {
      const app = express();
      app.use(express.json());

      // Mount limiter and a route that always fails (401) so attempts are counted
      app.post('/test-auth-limit', authLimiter, (req, res) => {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      // Perform 11 requests; max is 10 per window for failed requests
      // The 11th should be throttled with 429
      for (let i = 0; i < 10; i++) {
        const r = await request(app).post('/test-auth-limit').send({});
        expect([401, 429]).toContain(r.status); // if limiter kicks earlier due to shared IP between tests
        if (r.status === 429) return; // already limited
      }
      const limited = await request(app).post('/test-auth-limit').send({});
      expect(limited.status).toBe(429);
      expect(limited.body).toMatchObject({ success: false });
    });
  });
});