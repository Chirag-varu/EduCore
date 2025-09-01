import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../models/Courses.model.js"; 
import Lecture from "../models/lecture.model.js";
// import User from "../models/User.js";
import { StudentCourses } from "../models/StudentCourses.js";

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
        videoUrl:
          "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "intro-web-dev",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Setting up the Development Environment",
        videoUrl:
          "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "setup-env",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Building REST APIs with Express",
        videoUrl:
          "https://www.w3schools.com/html/mov_bbb.mp4",
        publicId: "express-api",
        isPreviewFree: false,
      },
    ]);
    console.log("📺 Lectures Seeded");

    // Seed Courses
    const courses = await Course.insertMany([
      {
        instructorId: "689dafb83d96d35705cfb0fc",
        instructorName: "Chirag Varu",
        title: "Full-Stack Web Development Bootcamp",
        subtitle: "Learn MERN Stack from scratch",
        description:
          "A complete hands-on bootcamp covering MongoDB, Express.js, React, and Node.js.",
        category: "web-development",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 499,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and deploy full-stack applications using the MERN stack.",
        enrolledStudents: ["68a55e919dab646029238b81"], // hardcoded student id
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
      },
      {
        instructorId: "689dafb83d96d35705cfb0fc",
        instructorName: "Chirag Varu",
        title: "Data Structures & Algorithms in JavaScript",
        subtitle: "Master problem solving & coding interviews",
        description:
          "This course covers arrays, linked lists, trees, graphs, and algorithms with JavaScript.",
        category: "data-science",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 299,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Crack coding interviews by mastering DS & Algo in JavaScript.",
        enrolledStudents: ["68a55e919dab646029238b81"],
        curriculum: [lectures[0]._id],
        isPublised: false,
      },
    ]);
    console.log("🎉 Courses Seeded Successfully");

    // ✅ Seed StudentCourses collection
    await StudentCourses.insertMany([
      {
        userId: "68a55e919dab646029238b81", // hardcoded student
        courses: [
          {
            courseId: courses[0]._id.toString(),
            title: courses[0].title,
            instructorId: courses[0].instructorId.toString(),
            instructorName: courses[0].instructorName,
            dateOfPurchase: new Date(),
            courseImage: courses[0].thumbnail,
          },
          {
            courseId: courses[1]._id.toString(),
            title: courses[1].title,
            instructorId: courses[1].instructorId.toString(),
            instructorName: courses[1].instructorName,
            dateOfPurchase: new Date(),
            courseImage: courses[1].thumbnail,
          },
        ],
      },
    ]);

    console.log("🎓 StudentCourses Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seedDB();
