/**
 * Input validation utilities for EduCore
 * Provides secure validation functions for user inputs
 */

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with success boolean and message
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!password || password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    isValid: true,
    message: 'Password is strong'
  };
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  return {
    isValid: true,
    message: 'Email is valid'
  };
};

/**
 * Validates username
 * @param {string} username - The username to validate
 * @returns {Object} - Validation result
 */
export const validateUsername = (username) => {
  const minLength = 2;
  const maxLength = 50;
  const validChars = /^[a-zA-Z0-9_\-\s]+$/;

  if (!username) {
    return {
      isValid: false,
      message: 'Username is required'
    };
  }

  if (username.length < minLength) {
    return {
      isValid: false,
      message: `Username must be at least ${minLength} characters long`
    };
  }

  if (username.length > maxLength) {
    return {
      isValid: false,
      message: `Username cannot exceed ${maxLength} characters`
    };
  }

  if (!validChars.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, spaces, hyphens, and underscores'
    };
  }

  return {
    isValid: true,
    message: 'Username is valid'
  };
};

/**
 * Sanitizes input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validates and sanitizes user registration data
 * @param {Object} userData - User registration data
 * @returns {Object} - Validation result with sanitized data
 */
export const validateUserRegistration = (userData) => {
  const { userName, userEmail, password, role } = userData;

  // Validate username
  const usernameValidation = validateUsername(userName);
  if (!usernameValidation.isValid) {
    return {
      isValid: false,
      message: usernameValidation.message
    };
  }

  // Validate email
  const emailValidation = validateEmail(userEmail);
  if (!emailValidation.isValid) {
    return {
      isValid: false,
      message: emailValidation.message
    };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      isValid: false,
      message: passwordValidation.message
    };
  }

  // Validate role
  const validRoles = ['student', 'instructor', 'admin'];
  if (role && !validRoles.includes(role)) {
    return {
      isValid: false,
      message: 'Invalid user role'
    };
  }

  // Return sanitized data
  return {
    isValid: true,
    sanitizedData: {
      userName: sanitizeInput(userName),
      userEmail: userEmail.toLowerCase().trim(),
      password: password, // Don't sanitize password as it will be hashed
      role: role || 'student'
    }
  };
};