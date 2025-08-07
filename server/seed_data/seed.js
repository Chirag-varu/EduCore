import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { Lecture } from '../models/lecture.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean old data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lecture.deleteMany({});

    // Step 1: Create 5 users
    const hashedPassword = await bcrypt.hash("password", 10);

    const users = await User.insertMany([
      { name: 'Chirag Varu', email: 'chiragvaru03@gmail.com', password: hashedPassword, role: 'instructor' },
      { name: 'Alice', email: 'alice@example.com', password: hashedPassword, role: 'student' },
      { name: 'Bob', email: 'bob@example.com', password: hashedPassword, role: 'student' },
      { name: 'Charlie', email: 'charlie@example.com', password: hashedPassword, role: 'student' },
      { name: 'Diana', email: 'diana@example.com', password: hashedPassword, role: 'student' },
      { name: 'Eve', email: 'eve@example.com', password: hashedPassword, role: 'student' },
    ]);

    const [u1, u2, u3, u4, u5] = users;

    // Step 2: Create 5 courses by user1 (instructor)
    const courses = await Promise.all([
      Course.create({
        courseTitle: 'Complete Web Development Bootcamp',
        subTitle: 'Learn HTML, CSS, JavaScript, React and more',
        description: 'Become a full-stack developer with this comprehensive course covering frontend and backend technologies',
        category: 'Web Development',
        courseLevel: 'Beginner',
        coursePrice: 99,
        courseThumbnail: `https://raw.githubusercontent.com/Chirag-varu/EduCore/refs/heads/master/client/src/assets/Logo.png`,
        creator: u1._id,
        isPublished: true,
      }),
      Course.create({
        courseTitle: 'Data Science Fundamentals',
        subTitle: 'Python, Pandas, NumPy and Machine Learning',
        description: 'Master data analysis and visualization with Python and popular data science libraries',
        category: 'Data Science',
        courseLevel: 'Medium',
        coursePrice: 149,
        courseThumbnail: `https://raw.githubusercontent.com/Chirag-varu/EduCore/refs/heads/master/client/src/assets/Logo.png`,
         
        creator: u1._id,
        isPublished: true,
      }),
      Course.create({
        courseTitle: 'Mobile App Development with Flutter',
        subTitle: 'Build cross-platform apps for iOS and Android',
        description: 'Learn to create beautiful, natively compiled applications from a single codebase',
        category: 'Mobile Development',
        courseLevel: 'Advance',
        coursePrice: 129,
        courseThumbnail: `https://raw.githubusercontent.com/Chirag-varu/EduCore/refs/heads/master/client/src/assets/Logo.png`,
         
        creator: u1._id,
        isPublished: true,
      }),
      Course.create({
        courseTitle: 'DevOps and Cloud Engineering',
        subTitle: 'Docker, Kubernetes, AWS and CI/CD Pipelines',
        description: 'Master containerization, orchestration and cloud deployment strategies',
        category: 'DevOps',
        courseLevel: 'Advance',
        coursePrice: 179,
        courseThumbnail: `https://raw.githubusercontent.com/Chirag-varu/EduCore/refs/heads/master/client/src/assets/Logo.png`,
         
        creator: u1._id,
        isPublished: true,
      }),
      Course.create({
        courseTitle: 'Cybersecurity Essentials',
        subTitle: 'Protect systems and networks from digital attacks',
        description: 'Learn ethical hacking, penetration testing and security best practices',
        category: 'Cybersecurity',
        courseLevel: 'Medium',
        coursePrice: 199,
        courseThumbnail: `https://raw.githubusercontent.com/Chirag-varu/EduCore/refs/heads/master/client/src/assets/Logo.png`,
         
        creator: u1._id,
        isPublished: true,
      })
    ]);

    // Step 3: Create lectures for each course
    const lecturesData = [
      // Web Development lectures
      [
        { title: 'Introduction to HTML & CSS', desc: 'Learn the building blocks of webpages', duration: 45 },
        { title: 'JavaScript Fundamentals', desc: 'Variables, functions and DOM manipulation', duration: 60 },
        { title: 'React Basics', desc: 'Components, props and state management', duration: 75 },
        { title: 'Database Integration', desc: 'Connecting to MongoDB with Node.js', duration: 90 },
        { title: 'Deployment Strategies', desc: 'Deploying to Vercel and Render', duration: 60 }
      ],
      // Data Science lectures
      [
        { title: 'Python for Data Analysis', desc: 'Basic Python concepts for data science', duration: 65 },
        { title: 'Pandas Deep Dive', desc: 'Data manipulation and cleaning', duration: 80 },
        { title: 'Data Visualization', desc: 'Creating charts with Matplotlib and Seaborn', duration: 70 },
        { title: 'Machine Learning Intro', desc: 'Supervised vs unsupervised learning', duration: 85 },
        { title: 'Model Evaluation', desc: 'Metrics for evaluating ML models', duration: 75 }
      ],
      // Mobile Development lectures
      [
        { title: 'Flutter Setup', desc: 'Installing and configuring the SDK', duration: 40 },
        { title: 'Widgets and Layouts', desc: 'Building UI components in Flutter', duration: 80 },
        { title: 'State Management', desc: 'Using Provider and Riverpod', duration: 90 },
        { title: 'API Integration', desc: 'Consuming REST APIs in Flutter', duration: 70 },
        { title: 'Publishing Apps', desc: 'App Store and Play Store submission', duration: 60 }
      ],
      // DevOps lectures
      [
        { title: 'Docker Fundamentals', desc: 'Containers, images and Dockerfiles', duration: 75 },
        { title: 'Kubernetes Basics', desc: 'Cluster architecture and deployments', duration: 90 },
        { title: 'AWS Setup', desc: 'Creating EC2 instances and configuring IAM', duration: 80 },
        { title: 'CI/CD Pipelines', desc: 'Automating builds with GitHub Actions', duration: 85 },
        { title: 'Monitoring', desc: 'Setting up logging and alerts', duration: 70 }
      ],
      // Cybersecurity lectures
      [
        { title: 'Security Principles', desc: 'CIA triad and security models', duration: 60 },
        { title: 'Network Security', desc: 'Firewalls, VPNs and intrusion detection', duration: 85 },
        { title: 'Pen Testing', desc: 'Ethical hacking methodology', duration: 90 },
        { title: 'Cryptography', desc: 'Encryption algorithms and PKI', duration: 75 },
        { title: 'Secure Coding', desc: 'OWASP top 10 vulnerabilities', duration: 80 }
      ]
    ];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const lectures = await Promise.all(
        lecturesData[i].map((lecture, j) =>
          Lecture.create({
            lectureTitle: lecture.title,
            description: lecture.desc,
            duration: lecture.duration,
            videoUrl: `https://assets.markup.io/app/uploads/2024/04/15GreatProductDemoVideostoWatchAndHowtoMakeOne-ezgif.com-gif-to-mp4-converter.mp4`,
            publicId: `educore-${course._id}-lecture${j + 1}`,
            isPreviewFree: j === 0,
          })
        )
      );

      course.lectures = lectures.map((l) => l._id);
      course.duration = lecturesData[i].reduce((sum, l) => sum + l.duration, 0);
      await course.save();
    }

    // Step 4: Enroll users 4, 2, 3 into all courses
    for (const user of [u4, u2, u3]) {
      user.enrolledCourses = courses.map((c) => c._id);
      await user.save();
    }

    // Step 5: Add users 1, 2, 3 to enrolledStudents of each course
    for (const course of courses) {
      course.enrolledStudents = [u4._id, u2._id, u3._id];
      await course.save();
    }

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
};

seed();
