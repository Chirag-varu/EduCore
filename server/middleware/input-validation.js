import validator from 'validator';

/**
 * Input sanitization middleware to prevent XSS and injection attacks
 */
export const sanitizeInput = (req, res, next) => {
  // Recursive function to sanitize object properties
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        // Escape HTML to prevent XSS
        obj[key] = validator.escape(obj[key]);
        // Trim whitespace
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  // Sanitize route parameters
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
};

/**
 * Request size validation middleware
 */
export const validateRequestSize = (req, res, next) => {
  const contentLength = req.get('Content-Length');
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Maximum size is 10MB.'
    });
  }

  next();
};

/**
 * Common field validation middleware factory
 */
export const validateFields = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    for (const field in validationRules) {
      const value = req.body[field];
      const rules = validationRules[field];

      // Check required fields
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is optional and empty
      if (!rules.required && (!value || value.toString().trim() === '')) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }

      // String validations
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
        }

        if (rules.email && !validator.isEmail(value)) {
          errors.push(`${field} must be a valid email address`);
        }

        if (rules.url && !validator.isURL(value)) {
          errors.push(`${field} must be a valid URL`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} cannot exceed ${rules.max}`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

export default {
  sanitizeInput,
  validateRequestSize,
  validateFields
};