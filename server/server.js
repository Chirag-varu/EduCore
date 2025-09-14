import { config } from "dotenv";
config();
import express, { json } from "express";
import cors from "cors";
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
import newsletterRoutes from "./routes/newsletter-routes/index.js";
import { startNewsletterScheduler } from "./helpers/newsletterScheduler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000", "https://accounts.google.com/o/oauth2"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/instructor/course", instructorCourseRoutes);
app.use("/api/v1/student/course", studentViewCourseRoutes);
app.use("/api/v1/student/order", studentViewOrderRoutes);
app.use("/api/v1/student/courses-bought", studentCoursesRoutes);
app.use("/api/v1/student/course-progress", studentCourseProgressRoutes);
app.use("/api/v1/student/video", videoDownloadRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);

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
