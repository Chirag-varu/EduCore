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

    req.user = payload;

    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authenticate;
