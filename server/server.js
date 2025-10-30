import { config } from "dotenv";
config();
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import { connect } from "mongoose";
import authRoutes from "./routes/auth-routes/index.js";
import mediaRoutes from "./routes/instructor-routes/media-routes.js";
import instructorCourseRoutes from "./routes/instructor-routes/course-routes.js";
import studentViewCourseRoutes from "./routes/student-routes/course-routes.js";
import studentViewOrderRoutes from "./routes/student-routes/order-routes.js";
import studentCoursesRoutes from "./routes/student-routes/student-courses-routes.js";
import studentCourseProgressRoutes from "./routes/student-routes/course-progress-routes.js";
import videoDownloadRoutes from "./routes/student-routes/video-download-routes.js";
import commentRoutes from "./routes/student-routes/comment-routes.js";
import chatRoutes from "./routes/chat-routes/index.js";
import newsletterRoutes from "./routes/newsletter-routes/index.js";
import adminRoutes from "./routes/admin-routes/index.js";
import instructorAssessmentRoutes from "./routes/instructor-routes/assessment-routes.js";
import studentAssessmentRoutes from "./routes/student-routes/assessment-routes.js";
import { startNewsletterScheduler } from "./helpers/newsletterScheduler.js";
import { generalLimiter, authLimiter, apiLimiter, uploadLimiter } from "./middleware/rate-limit.js";
import { sanitizeInput, validateRequestSize } from "./middleware/input-validation.js";
import { apiSecurityHeaders } from "./middleware/security.js";

// Environment variable validation
const coreRequiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL'
];

const featureEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_SECRET_ID',
  'Email_Service',
  'Email',
  'Email_Password',
  'GOOGLE_CLIENT_ID'
];

const optionalEnvVars = [
  'PORT',
  'REDIS_URL'
];

const missingCoreVars = coreRequiredEnvVars.filter(envVar => !process.env[envVar]);
const missingFeatureVars = featureEnvVars.filter(envVar => !process.env[envVar]);

if (missingCoreVars.length > 0) {
  console.error('❌ Missing critical environment variables:');
  missingCoreVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

if (missingFeatureVars.length > 0) {
  console.warn('⚠️  Missing feature environment variables (some features may be disabled):');
  missingFeatureVars.forEach(envVar => console.warn(`   - ${envVar}`));
  console.warn('Check the .env.example file for complete configuration.');
}

// Security validation for sensitive variables
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long for security');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  // Additional production-specific validations
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-here') {
    console.error('❌ JWT_SECRET cannot use default value in production');
    process.exit(1);
  }
  
  if (!process.env.CLIENT_URL.startsWith('https://')) {
    console.warn('⚠️  CLIENT_URL should use HTTPS in production');
  }
}

// Log optional variables that are missing (warnings only)
const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
if (missingOptionalVars.length > 0) {
  console.warn('⚠️  Optional environment variables not set (using defaults):');
  missingOptionalVars.forEach(envVar => console.warn(`   - ${envVar}`));
}

console.log('✅ Environment variables validated successfully');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some video players
}));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000", "https://accounts.google.com/o/oauth2"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Apply security headers for API responses
app.use(apiSecurityHeaders);

// Input validation and sanitization
app.use(sanitizeInput);
app.use(validateRequestSize);

app.use(json({ limit: '10mb' }));

//database connection
connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB is connected");
    // Start the newsletter scheduler after database connection is established
    startNewsletterScheduler();
  })
  .catch((e) => console.log(e));

//routes configuration
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/media", uploadLimiter, mediaRoutes);
app.use("/api/v1/instructor/course", apiLimiter, instructorCourseRoutes);
app.use("/api/v1/student/course", apiLimiter, studentViewCourseRoutes);
app.use("/api/v1/student/order", apiLimiter, studentViewOrderRoutes);
app.use("/api/v1/student/courses-bought", apiLimiter, studentCoursesRoutes);
app.use("/api/v1/student/course-progress", apiLimiter, studentCourseProgressRoutes);
app.use("/api/v1/student/video", apiLimiter, videoDownloadRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/admin", apiLimiter, adminRoutes);
app.use("/api/v1/instructor/assessment", apiLimiter, instructorAssessmentRoutes);
app.use("/api/v1/student/assessment", apiLimiter, studentAssessmentRoutes);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port: ${PORT}`);
});
