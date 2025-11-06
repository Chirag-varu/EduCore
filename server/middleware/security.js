import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Security headers middleware configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
});

/**
 * API-specific rate limiting
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many API requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Do not count successful requests towards the rate limit
  skipSuccessfulRequests: true,
});

/**
 * Request body size limiting middleware
 */
export const requestSizeLimiter = (req, res, next) => {
  // Set limits based on route
  const path = req.path;
  let limit = '1mb'; // Default limit

  // Higher limits for upload routes
  if (path.includes('/upload') || path.includes('/media')) {
    limit = '50mb';
  }

  // Set the limit in Express
  req.express = req.express || {};
  req.express.limit = limit;

  next();
};

/**
 * Security headers for API responses
 */
export const apiSecurityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API-specific headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  next();
};

export default {
  securityHeaders,
  apiRateLimit,
  requestSizeLimiter,
  apiSecurityHeaders
};