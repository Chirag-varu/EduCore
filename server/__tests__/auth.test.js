import { validatePassword, validateEmail, validateUsername } from '../helpers/validation.js';

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
});