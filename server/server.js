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
import { startNewsletterScheduler } from "./helpers/newsletterScheduler.js";
import { generalLimiter, authLimiter, apiLimiter, uploadLimiter } from "./middleware/rate-limit.js";

// Environment variable validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
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

app.use(json());

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
