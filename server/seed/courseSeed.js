import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../models/Courses.model.js";
import Lecture from "../models/lecture.model.js";
// import User from "../models/User.js";
import StudentCourses from "../models/StudentCourses.js";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear old data
    await Course.deleteMany();
    await Lecture.deleteMany();
    await StudentCourses.deleteMany();

    // Seed Lectures
    const lectures = await Lecture.insertMany([
      {
        lectureTitle: "Introduction to Web Development",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "intro-web-dev",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Setting up the Development Environment",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "setup-env",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Building REST APIs with Express",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "express-api",
        isPreviewFree: false,
      },
    ]);
    console.log("📺 Lectures Seeded");

    // Seed Courses - create multiple varied courses
    const courseTemplates = [
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Full-Stack Web Development Bootcamp",
        subtitle: "Learn MERN Stack from scratch",
        description:
          "A complete hands-on bootcamp covering MongoDB, Express.js, React, and Node.js.",
        category: "web-development",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Full-Stack",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 499,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and deploy full-stack applications using the MERN stack.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("689db59c3de3445393020261"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId(),
        instructorName: "Alice Martin",
        title: "Data Structures & Algorithms in JavaScript",
        subtitle: "Master problem solving & coding interviews",
        description:
          "This course covers arrays, linked lists, trees, graphs, and algorithms with JavaScript.",
        category: "computer-science",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=DSA",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 299,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Crack coding interviews by mastering DS & Algo in JavaScript.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("689db59c3de3445393020261"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId(),
        instructorName: "David Lee",
        title: "Python for Beginners",
        subtitle: "Start coding with Python",
        description: "Beginner-friendly course to learn Python programming.",
        category: "programming",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Python",
        price: 199,
        freePreview: true,
        certificate: false,
        lifetime: true,
        objectives: "Learn Python fundamentals and build small projects.",
        curriculum: [lectures[1]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("689db59c3de3445393020261"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId(),
        instructorName: "Sara Williams",
        title: "UI/UX Design Fundamentals",
        subtitle: "Design beautiful user experiences",
        description: "Design principles, prototyping, and user testing.",
        category: "design",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=UI%2FUX",
        price: 149,
        freePreview: false,
        certificate: false,
        lifetime: true,
        objectives: "Create user-centered designs and prototypes.",
        curriculum: [lectures[2]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("689db59c3de3445393020261"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId(),
        instructorName: "Michael Brown",
        title: "Advanced React Patterns",
        subtitle: "Build scalable React apps",
        description: "Hooks, context, performance optimizations and patterns.",
        category: "web-development",
        language: "English",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400?text=React",
        price: 349,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives: "Architect high-quality React applications.",
        curriculum: [lectures[0]._id, lectures[1]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("689db59c3de3445393020261"),
        ],
      },
    ];

    const courses = await Course.insertMany(courseTemplates);
    console.log("🎉 Courses Seeded Successfully");

    // ✅ Enroll ALL users into ALL created courses (StudentCourses collection)
    const users = await User.find({});

    if (users.length === 0) {
      console.log("No users found to enroll. Skipping enrollment step.");
    } else {
      const enrollPromises = users.map((user) => {
        const coursesForUser = courses.map((c) => ({
          courseId: c._id.toString(),
          title: c.title,
          instructorId: c.instructorId ? c.instructorId.toString() : "",
          instructorName: c.instructorName || "",
          dateOfPurchase: new Date(),
          courseImage: c.thumbnail || "",
        }));

        // Upsert StudentCourses document for the user
        return StudentCourses.findOneAndUpdate(
          { userId: user._id.toString() },
          { userId: user._id.toString(), courses: coursesForUser },
          { upsert: true, new: true }
        );
      });

      await Promise.all(enrollPromises);
      console.log("🎓 All users enrolled into all seeded courses");
    }

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seedDB();
