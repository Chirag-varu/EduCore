import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../models/Courses.model.js";
import { Lecture } from "../models/lecture.model.js";
import User from "../models/User.js";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EduCore";

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Clear old data
    await Course.deleteMany();
    await Lecture.deleteMany();

    // Seed Lectures
    const lectures = await Lecture.insertMany([
      {
        lectureTitle: "Introduction to Web Development",
        videoUrl:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        publicId: "intro-web-dev",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Setting up the Development Environment",
        videoUrl:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        publicId: "setup-env",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Building REST APIs with Express",
        videoUrl:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        publicId: "express-api",
        isPreviewFree: false,
      },
    ]);

    console.log("📺 Lectures Seeded");

    // Optional: Get users if you already have them
    const users = await User.find({ role: "student" }).limit(2);

    // Seed Courses
    const courses = [
      {
        instructorId: users[0]?._id || new mongoose.Types.ObjectId(),
        instructorName: users[0]?.name || "John Doe",
        title: "Full-Stack Web Development Bootcamp",
        subtitle: "Learn MERN Stack from scratch",
        description:
          "A complete hands-on bootcamp covering MongoDB, Express.js, React, and Node.js.",
        category: "Web Development",
        language: "English",
        level: "Beginner",
        thumbnail: "https://placehold.co/600x400",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 499,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and deploy full-stack applications using the MERN stack.",
        enrolledStudents: [users[1]?._id || new mongoose.Types.ObjectId()],
        curriculum: lectures.map((lec) => lec._id), // attach seeded lectures
        isPublised: true,
      },
      {
        instructorId: users[1]?._id || new mongoose.Types.ObjectId(),
        instructorName: users[1]?.name || "Jane Smith",
        title: "Data Structures & Algorithms in JavaScript",
        subtitle: "Master problem solving & coding interviews",
        description:
          "This course covers arrays, linked lists, trees, graphs, and algorithms with JavaScript.",
        category: "Programming",
        language: "English",
        level: "Intermediate",
        thumbnail: "https://placehold.co/600x400",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 299,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Crack coding interviews by mastering DS & Algo in JavaScript.",
        enrolledStudents: [],
        curriculum: [lectures[0]._id], // link only first lecture
        isPublised: false,
      },
    ];

    await Course.insertMany(courses);
    console.log("🎉 Courses Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seedDB();
