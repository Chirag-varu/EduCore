# 📚 EduCore – Modern Learning Management System

**EduCore** is a comprehensive web-based Learning Management System (LMS) designed to facilitate seamless online education for students, instructors, and administrators. The platform provides a full-featured educational experience with course management, real-time communication, payment processing, and advanced user authentication.

---

## 🚀 Status

**Current Version:** 1.15.4  
**Status:** Stable production-ready release with enhanced security  
**Last Updated:** October 27, 2025  

The project is feature-complete with a robust architecture supporting role-based access control, real-time features, comprehensive course management capabilities, and enterprise-grade security implementations.

---

## ✨ Key Features

### 🎓 Core LMS Features
- **Course Management**: Complete CRUD operations for courses with video lectures
- **User Roles**: Student, Instructor, and Admin dashboards with distinct permissions
- **Progress Tracking**: Real-time course completion and lecture progress monitoring
- **Payment Integration**: Secure PayPal payment processing for course enrollments
- **Real-time Chat**: Live messaging system between students and instructors
- **Media Management**: Cloudinary integration for video/image uploads and streaming

### 🔐 Security & Authentication  
- **JWT Authentication**: Secure token-based authentication with fail-safe configuration
- **Password Complexity**: Enforced strong password requirements (8+ chars, uppercase, lowercase, numbers, special chars)
- **Rate Limiting**: Advanced rate limiting on authentication endpoints to prevent brute force attacks
- **Input Validation**: Comprehensive server-side validation for all user inputs
- **Google OAuth**: Social login integration for enhanced user experience
- **OTP Verification**: Email-based verification for account security
- **Password Reset**: Secure password recovery system with time-limited tokens
- **Role-based Access**: Granular permissions based on user roles

### 🧪 Testing & Quality Assurance
- **Jest Testing Framework**: Comprehensive test suite with 21+ passing tests
- **Unit Tests**: Authentication, validation, and model testing
- **Security Auditing**: Regular security assessments and vulnerability management
- **Code Quality**: ES6+ modules with proper error handling and validation

### 📱 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Toggle between light and dark themes
- **Modern UI**: Radix UI components for consistent design language
- **Real-time Updates**: Live notifications and progress updates
- **Newsletter System**: Automated newsletter scheduling and management

---

## 🧰 Tech Stack

**Frontend:** Vite + React 18.3 + JavaScript + Tailwind CSS + Radix UI  
**Backend:** Node.js + Express.js + JavaScript  
**Database:** MongoDB Atlas with Mongoose ODM  
**Caching:** Redis for session management and performance  
**Payment:** PayPal integration for secure transactions  
**Media Storage:** Cloudinary for video and image management  
**Email Service:** Nodemailer for OTP and notifications  
**Authentication:** JWT + Google OAuth 2.0  

---

## � Recent Improvements (v1.15.4)

### Security Enhancements
- ✅ **Fixed Critical JWT Security**: Removed hardcoded fallback secrets
- ✅ **Password Complexity**: Implemented comprehensive password strength validation
- ✅ **Rate Limiting**: Added protection against brute force attacks on auth endpoints
- ✅ **Input Validation**: Enhanced server-side validation with detailed error messages

### Development & Testing
- ✅ **Jest Testing Framework**: Configured testing environment with 21+ unit tests
- ✅ **Model Validation**: Enhanced Course and Lecture models with comprehensive validation
- ✅ **Code Quality**: Improved error handling and data validation across the application

### Database & Performance
- ✅ **Database Indexing**: Added strategic indexes for improved query performance
- ✅ **Virtual Properties**: Added computed fields for better data access
- ✅ **Model Methods**: Implemented utility methods for common operations

---

## �📂 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Chirag-varu/EduCore.git
cd EduCore
```

### 2. Install dependencies

```bash
chmod 700 setup.sh
bash ./setup.sh

or 

npm run install-all
```

### 3. Run Seed File

```bash
npm run seed
```

### 4. Run locally

```bash
chmod 700 run.sh
bash run.sh

or 

npm run dev
```

### 5. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (server only)
cd server && npm run test:watch

# Run specific test files
cd server && npm test -- auth.test.js
```

### 6. Redis Setup (Required)

You can install or download it to your local space but we recommend using Docker in local and prod environment:

```bash
docker run --name redis -p 6379:6379 -d redis
docker start redis
```

to check if it's running:

```bash
docker exec -it redis redis-cli ping
```

---

## 🏗️ Project Architecture

```bash
EduCore/
├── client/                    → Frontend (Vite + React + Tailwind)
│   ├── src/
│   │   ├── components/        → Reusable UI components
│   │   ├── pages/            → Route-based page components
│   │   ├── context/          → React Context providers
│   │   ├── services/         → API service functions
│   │   ├── lib/              → Utility functions and configurations
│   │   └── config/           → Application configuration
│   └── public/               → Static assets
├── server/                    → Backend (Node.js + Express)
│   ├── controllers/          → Route handlers and business logic
│   ├── models/               → MongoDB schemas and models
│   ├── routes/               → API route definitions
│   ├── middleware/           → Custom middleware functions
│   ├── helpers/              → Utility functions and services
│   └── seed/                 → Database seeding scripts
├── package.json              → Root package configuration
├── start-dev.js              → Development server launcher
└── install-deps.js           → Dependency installation script
```

### 🔗 API Endpoints Structure
- `/api/v1/auth/*` - Authentication and user management
- `/api/v1/instructor/*` - Instructor-specific operations
- `/api/v1/student/*` - Student-specific operations  
- `/api/v1/admin/*` - Admin panel operations
- `/api/v1/chat/*` - Real-time messaging system

---

## 🎯 Role-Based Access

### 👨‍🎓 Student Dashboard (`/home`)
- Browse and search courses
- Enroll in courses with PayPal payment
- Track learning progress
- Watch video lectures
- Chat with instructors
- Download course materials

### 👨‍🏫 Instructor Dashboard (`/instructor`) 
- Create and manage courses
- Upload video content
- Monitor student progress
- Respond to student queries
- Analyze course performance

### 👨‍💼 Admin Dashboard (`/admin/newsletters`)
- Manage all users and courses
- Send newsletters and announcements
- Monitor system analytics
- Configure platform settings

---

## Live Link: (coming soon...) (Production Deployment)

---

## **License** 📜
This project is licensed under the [MIT License](LICENSE).
You are free to use, modify, and distribute this software with proper attribution.
---