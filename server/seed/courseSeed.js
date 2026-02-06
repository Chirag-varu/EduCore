import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../models/Courses.model.js";
import Lecture from "../models/lecture.model.js";
import StudentCourses from "../models/StudentCourses.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
const DB_NAME = process.env.DB_NAME || undefined; // Optional explicit DB name to avoid case conflicts

const seedDB = async () => {
  try {
  await mongoose.connect(MONGO_URI, DB_NAME ? { dbName: DB_NAME } : undefined);
    console.log("✅ MongoDB Connected");

    // Clear old data
    await Course.deleteMany();
    await Lecture.deleteMany();
    await StudentCourses.deleteMany();

    // Ensure demo users exist (student, instructor, admin)
    const demoUsers = [
      {
        userName: "Demo Student",
        userEmail: "student@demo.com",
        role: "student",
        password: "Password@123",
      },
      {
        userName: "Demo Instructor",
        userEmail: "instructor@demo.com",
        role: "instructor",
        password: "Password@123",
      },
      {
        userName: "Demo Admin",
        userEmail: "admin@demo.com",
        role: "admin",
        password: "Password@123",
      },
    ];

    for (const du of demoUsers) {
      const existing = await User.findOne({ userEmail: du.userEmail });
      if (!existing) {
        const hash = await bcrypt.hash(du.password, 10);
        await User.create({
          userName: du.userName,
          userEmail: du.userEmail,
          role: du.role,
          password: hash,
        });
        console.log(`👤 Created ${du.role} user: ${du.userEmail}`);
      } else {
        console.log(`ℹ️  User exists: ${du.userEmail}`);
      }
    }

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
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
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
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
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
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
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
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
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
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      // Machine Learning & AI Courses
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Machine Learning with Python",
        subtitle: "From basics to building ML models",
        description:
          "Comprehensive course covering supervised learning, unsupervised learning, neural networks, and practical ML projects using scikit-learn and TensorFlow.",
        category: "machine-learning",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Machine+Learning",
        promotionalVideo:
          "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
        price: 599,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build, train, and deploy machine learning models for real-world applications.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Deep Learning & Neural Networks",
        subtitle: "Master deep learning architectures",
        description:
          "Learn CNNs, RNNs, LSTMs, Transformers, and build AI applications using PyTorch and Keras.",
        category: "artificial-intelligence",
        language: "English",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400?text=Deep+Learning",
        price: 699,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Design and implement deep neural networks for computer vision and NLP tasks.",
        curriculum: [lectures[0]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Cloud & DevOps Courses
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "AWS Cloud Practitioner Essentials",
        subtitle: "Start your cloud journey",
        description:
          "Learn AWS fundamentals including EC2, S3, Lambda, RDS, and prepare for the AWS Cloud Practitioner certification.",
        category: "cloud-computing",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=AWS+Cloud",
        price: 249,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Understand core AWS services and pass the Cloud Practitioner exam.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Docker & Kubernetes Masterclass",
        subtitle: "Container orchestration from scratch",
        description:
          "Master containerization with Docker, orchestrate with Kubernetes, and deploy microservices at scale.",
        category: "devops",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Docker+K8s",
        price: 449,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Build, deploy, and manage containerized applications using Docker and Kubernetes.",
        curriculum: [lectures[1]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "CI/CD Pipeline with GitHub Actions",
        subtitle: "Automate your development workflow",
        description:
          "Learn to build automated CI/CD pipelines using GitHub Actions, including testing, building, and deploying applications.",
        category: "devops",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=CI%2FCD",
        price: 299,
        freePreview: true,
        certificate: false,
        lifetime: true,
        objectives:
          "Implement continuous integration and deployment pipelines for modern applications.",
        curriculum: [lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Cyber Security Courses
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Ethical Hacking & Penetration Testing",
        subtitle: "Become a white-hat hacker",
        description:
          "Learn ethical hacking techniques, vulnerability assessment, network security, and penetration testing methodologies.",
        category: "ethical-hacking",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Ethical+Hacking",
        price: 549,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Perform security assessments and identify vulnerabilities in systems and networks.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Cybersecurity Fundamentals",
        subtitle: "Protect systems and data",
        description:
          "Understand security principles, cryptography, network security, and best practices for securing applications.",
        category: "cyber-security",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Cybersecurity",
        price: 199,
        freePreview: true,
        certificate: false,
        lifetime: true,
        objectives:
          "Apply security best practices to protect digital assets and infrastructure.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      // Mobile Development Courses
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "React Native Mobile Development",
        subtitle: "Build cross-platform mobile apps",
        description:
          "Create iOS and Android apps using React Native, including navigation, state management, and native module integration.",
        category: "mobile-development",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=React+Native",
        price: 399,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and publish cross-platform mobile applications using React Native.",
        curriculum: [lectures[0]._id, lectures[1]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Flutter App Development",
        subtitle: "Beautiful native apps with Dart",
        description:
          "Master Flutter framework to build stunning cross-platform mobile applications with Dart programming language.",
        category: "mobile-development",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Flutter",
        price: 349,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Create beautiful, natively compiled applications from a single codebase.",
        curriculum: [lectures[1]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Data Science & Big Data
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Data Science with Python & Pandas",
        subtitle: "Analyze and visualize data",
        description:
          "Learn data analysis, visualization, and statistical modeling using Python, Pandas, NumPy, and Matplotlib.",
        category: "data-science",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Data+Science",
        price: 449,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Perform data analysis and create insightful visualizations from complex datasets.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Big Data with Apache Spark",
        subtitle: "Process massive datasets",
        description:
          "Learn to process and analyze big data using Apache Spark, PySpark, and distributed computing concepts.",
        category: "big-data",
        language: "English",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400?text=Big+Data",
        price: 549,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Build scalable data processing pipelines using Apache Spark ecosystem.",
        curriculum: [lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Database & Backend
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "MongoDB Complete Developer Guide",
        subtitle: "Master NoSQL databases",
        description:
          "Comprehensive MongoDB course covering CRUD operations, aggregation, indexing, and database design patterns.",
        category: "database-systems",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=MongoDB",
        price: 299,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Design and implement efficient MongoDB databases for modern applications.",
        curriculum: [lectures[0]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Node.js Backend Development",
        subtitle: "Build robust server-side apps",
        description:
          "Master Node.js, Express.js, authentication, RESTful APIs, and microservices architecture.",
        category: "backend-development",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Node.js",
        price: 399,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build production-ready backend applications with Node.js and Express.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      // Frontend Development
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Modern CSS & Tailwind Mastery",
        subtitle: "Style beautiful web interfaces",
        description:
          "Learn modern CSS techniques, Flexbox, Grid, animations, and utility-first styling with Tailwind CSS.",
        category: "frontend-development",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=CSS+Tailwind",
        price: 199,
        freePreview: true,
        certificate: false,
        lifetime: true,
        objectives:
          "Create responsive, beautiful web interfaces using modern CSS and Tailwind.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "TypeScript for JavaScript Developers",
        subtitle: "Add types to your JavaScript",
        description:
          "Learn TypeScript from scratch, including types, interfaces, generics, and integrating with React and Node.js.",
        category: "programming-languages",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=TypeScript",
        price: 279,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Write type-safe JavaScript applications using TypeScript.",
        curriculum: [lectures[1]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Blockchain & Game Development
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Blockchain Development with Solidity",
        subtitle: "Build decentralized applications",
        description:
          "Learn smart contract development, Ethereum, Web3.js, and build DApps from scratch.",
        category: "blockchain",
        language: "English",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400?text=Blockchain",
        price: 649,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Develop and deploy smart contracts and decentralized applications on Ethereum.",
        curriculum: [lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Game Development with Unity",
        subtitle: "Create 2D & 3D games",
        description:
          "Learn Unity game engine, C# programming, physics, animations, and publish games to multiple platforms.",
        category: "game-development",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Unity+Games",
        price: 399,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and publish complete 2D and 3D games using Unity engine.",
        curriculum: [lectures[0]._id, lectures[1]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Software Engineering & Testing
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Software Testing & QA Automation",
        subtitle: "Ensure software quality",
        description:
          "Learn manual testing, automation with Selenium, Jest, API testing, and CI/CD integration for QA.",
        category: "software-testing",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=QA+Testing",
        price: 349,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Implement comprehensive testing strategies and automate test suites.",
        curriculum: [lectures[1]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Software Architecture & Design Patterns",
        subtitle: "Build maintainable systems",
        description:
          "Master SOLID principles, design patterns, microservices architecture, and system design for scalable applications.",
        category: "software-engineering",
        language: "English",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400?text=Architecture",
        price: 499,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Design and architect scalable, maintainable software systems.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [],
      },
      // Networking & Automation
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Computer Networking Fundamentals",
        subtitle: "Understand network protocols",
        description:
          "Learn TCP/IP, DNS, HTTP, firewalls, routing, and network troubleshooting essentials.",
        category: "networking",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Networking",
        price: 249,
        freePreview: true,
        certificate: false,
        lifetime: true,
        objectives:
          "Understand network protocols and troubleshoot common networking issues.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "RPA with UiPath & Python",
        subtitle: "Automate repetitive tasks",
        description:
          "Learn robotic process automation using UiPath and Python to automate business workflows.",
        category: "automation",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=RPA+Automation",
        price: 399,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Build automation bots to streamline business processes and workflows.",
        curriculum: [lectures[1]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // UI/UX & Digital Marketing
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Advanced UI/UX with Figma",
        subtitle: "Design professional interfaces",
        description:
          "Master Figma for UI design, prototyping, design systems, and collaboration with development teams.",
        category: "ui-ux-design",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Figma+Design",
        price: 299,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Create professional UI designs and interactive prototypes using Figma.",
        curriculum: [lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Digital Marketing & SEO Mastery",
        subtitle: "Grow your online presence",
        description:
          "Learn SEO, content marketing, social media marketing, Google Ads, and analytics for digital growth.",
        category: "digital-marketing",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Digital+Marketing",
        price: 349,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Develop and execute digital marketing strategies to drive traffic and conversions.",
        curriculum: [lectures[0]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Project Management
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Agile & Scrum Project Management",
        subtitle: "Lead successful projects",
        description:
          "Master Agile methodologies, Scrum framework, sprint planning, and tools like Jira for effective project delivery.",
        category: "project-management",
        language: "English",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400?text=Agile+Scrum",
        price: 279,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Implement Agile practices and lead successful software development projects.",
        curriculum: [lectures[0]._id, lectures[1]._id],
        isPublised: true,
        enrolledStudents: [],
      },
      // Fullstack Development
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "Next.js Full-Stack Development",
        subtitle: "Build production-ready apps",
        description:
          "Master Next.js 14, Server Components, API routes, authentication, and deploy to Vercel.",
        category: "fullstack-development",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=Next.js",
        price: 449,
        freePreview: true,
        certificate: true,
        lifetime: true,
        objectives:
          "Build and deploy production-ready full-stack applications with Next.js.",
        curriculum: lectures.map((lec) => lec._id),
        isPublised: true,
        enrolledStudents: [
          new mongoose.Types.ObjectId("68a55e919dab646029238b81"),
        ],
      },
      {
        instructorId: new mongoose.Types.ObjectId("689dafb83d96d35705cfb0fc"),
        instructorName: "Chirag Varu",
        title: "GraphQL API Development",
        subtitle: "Modern API architecture",
        description:
          "Learn GraphQL fundamentals, Apollo Server & Client, subscriptions, and integrate with React applications.",
        category: "backend-development",
        language: "English",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400?text=GraphQL",
        price: 349,
        freePreview: false,
        certificate: true,
        lifetime: true,
        objectives:
          "Design and implement flexible APIs using GraphQL and Apollo.",
        curriculum: [lectures[1]._id, lectures[2]._id],
        isPublised: true,
        enrolledStudents: [],
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
