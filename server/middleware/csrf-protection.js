/**
 * Simple CSRF protection for state-changing operations
 * This is a lightweight implementation for API endpoints
 */

import crypto from 'crypto';

// Store CSRF tokens temporarily (in production, use Redis)
const csrfTokens = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate CSRF token endpoint
 */
export const generateCSRFToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const userId = req.user?.userId || req.ip; // Use user ID or IP as fallback
  
  // Store token with expiry
  csrfTokens.set(userId, {
    token,
    expires: Date.now() + TOKEN_EXPIRY
  });

  // Clean up expired tokens
  cleanupExpiredTokens();

  res.json({
    success: true,
    csrfToken: token
  });
};

/**
 * Validate CSRF token middleware
 */
export const validateCSRFToken = (req, res, next) => {
  // Skip CSRF for GET requests and authentication endpoints
  if (req.method === 'GET' || req.path.includes('/auth/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const userId = req.user?.userId || req.ip;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token is required'
    });
  }

  const storedTokenData = csrfTokens.get(userId);

  if (!storedTokenData) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token not found or expired'
    });
  }

  if (storedTokenData.expires < Date.now()) {
    csrfTokens.delete(userId);
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired'
    });
  }

  if (storedTokenData.token !== token) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [userId, tokenData] of csrfTokens.entries()) {
    if (tokenData.expires < now) {
      csrfTokens.delete(userId);
    }
  }
};

// Clean up expired tokens every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000);

export default {
  generateCSRFToken,
  validateCSRFToken
};