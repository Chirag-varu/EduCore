import { validatePassword, validateEmail, validateUsername } from '../helpers/validation.js';

describe('Validation Helper Tests', () => {
  
  describe('Password Validation', () => {
    test('should validate password length', () => {
      expect(validatePassword('short').isValid).toBe(false);
      expect(validatePassword('ThisIsAValidPassword123!').isValid).toBe(true);
    });

    test('should validate character requirements', () => {
      expect(validatePassword('alllowercase123!').isValid).toBe(false);
      expect(validatePassword('ALLUPPERCASE123!').isValid).toBe(false);
      expect(validatePassword('NoNumbers!').isValid).toBe(false);
      expect(validatePassword('NoSpecialChars123').isValid).toBe(false);
      expect(validatePassword('ValidPass123!').isValid).toBe(true);
    });
  });

  describe('Email Validation', () => {
    test('should validate email format', () => {
      expect(validateEmail('valid@email.com').isValid).toBe(true);
      expect(validateEmail('invalid.email').isValid).toBe(false);
      expect(validateEmail('@invalid.com').isValid).toBe(false);
      expect(validateEmail('invalid@').isValid).toBe(false);
      expect(validateEmail('test@test@test.com').isValid).toBe(false);
    });
  });

  describe('Username Validation', () => {
    test('should validate username requirements', () => {
      expect(validateUsername('validuser').isValid).toBe(true);
      expect(validateUsername('valid_user-123').isValid).toBe(true);
      expect(validateUsername('a').isValid).toBe(false); // too short
      expect(validateUsername('').isValid).toBe(false); // empty
    });
  });
});