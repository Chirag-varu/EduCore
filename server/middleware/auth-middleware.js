import jwt from "jsonwebtoken";

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeader");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  // Ensure JWT_SECRET is properly configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not configured");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET);

    // Additional token validation: allow either `_id` or `userId` from legacy/new tokens
    if (!(payload?._id || payload?.userId) || !payload.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Check token expiry explicitly (JWT library handles this, but good to be explicit)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Normalize user object for backward compatibility across controllers
    // Many controllers expect `req.user._id`, while newer code uses `userId`.
    // Provide all common keys without overwriting existing valid values.
    const normalizedId = payload.userId || payload._id || payload.id;
    req.user = {
      ...payload,
      userId: normalizedId,
      _id: payload._id || normalizedId,
      id: payload.id || normalizedId,
    };

    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  }
};

export default authenticate;
