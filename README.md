# 📚 EduCore – Modern Learning Management System

**EduCore** is a comprehensive web-based Learning Management System (LMS) designed to facilitate seamless online education for students, instructors, and administrators. The platform provides a full-featured educational experience with course management, real-time communication, payment processing, and advanced user authentication.

## 📋 Table of Contents

| Section | Description |
|---------|-------------|
| [🚀 Project Information](#-project-information) | Version, status, and basic project details |
| [✨ Key Features](#-key-features) | Core LMS, security, testing, and UX features |
| [🧰 Tech Stack](#-tech-stack) | Complete technology breakdown with versions |
| [🚀 Recent Improvements](#-recent-improvements-v1154) | Latest security and feature enhancements |
| [📂 Setup Instructions](#-setup-instructions) | Installation, testing, and Redis setup |
| [🔗 API Endpoints](#-api-endpoints-structure) | API structure and access patterns |
| [🎯 Role-Based Access](#-role-based-access-control) | User roles and permissions breakdown |
| [📊 Project Overview](#-project-overview) | Metrics, deployment, and contributing info |

---

## 🚀 Project Information

| Attribute | Details |
|-----------|---------|
| **Project Name** | EduCore - Modern Learning Management System |
| **Version** | 1.15.5 |
| **Status** | ✅ Stable production-ready release with enhanced security |
| **Last Updated** | October 28, 2025 |
| **Architecture** | Full-stack with role-based access control |
| **License** | MIT |
| **Repository** | [GitHub - EduCore](https://github.com/Chirag-varu/EduCore) |

The project is feature-complete with a robust architecture supporting role-based access control, real-time features, comprehensive course management capabilities, and enterprise-grade security implementations.

---

## ✨ Key Features

### 🎓 Core LMS Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Course Management** | Complete CRUD operations for courses with video lectures | ✅ |
| **User Roles** | Student, Instructor, and Admin dashboards with distinct permissions | ✅ |
| **Progress Tracking** | Real-time course completion and lecture progress monitoring | ✅ |
| **Payment Integration** | Secure PayPal payment processing for course enrollments | ✅ |
| **Real-time Chat** | Live messaging system between students and instructors | ✅ |
| **Media Management** | Cloudinary integration for video/image uploads and streaming | ✅ |

### 🔐 Security & Authentication

| Security Feature | Implementation | Status |
|------------------|----------------|--------|
| **JWT Authentication** | Secure token-based auth with fail-safe configuration | ✅ |
| **Password Complexity** | 8+ chars, uppercase, lowercase, numbers, special chars | ✅ |
| **Rate Limiting** | Advanced rate limiting on auth endpoints (brute force protection) | ✅ |
| **Input Validation** | Comprehensive server-side validation and sanitization | ✅ |
| **Google OAuth** | Social login integration for enhanced UX | ✅ |
| **OTP Verification** | Email-based account verification system | ✅ |
| **Password Reset** | Secure recovery system with time-limited tokens | ✅ |
| **Role-based Access** | Granular permissions based on user roles | ✅ |
| **Security Headers** | Helmet.js for HTTP security headers | ✅ |
| **CSRF Protection** | Cross-site request forgery protection middleware | ✅ |

### 🧪 Testing & Quality Assurance

| Testing Aspect | Implementation | Coverage |
|----------------|----------------|----------|
| **Testing Framework** | Jest with Babel transpilation | ✅ |
| **Unit Tests** | Authentication, validation, models, security | 31+ tests |
| **API Testing** | Supertest for HTTP endpoint testing | ✅ |
| **Security Testing** | Input validation and sanitization tests | ✅ |
| **Test Coverage** | Comprehensive coverage of critical components | 90%+ |
| **Code Quality** | ES6+ modules with error handling validation | ✅ |

### 📱 User Experience

| UX Feature | Technology | Status |
|------------|------------|--------|
| **Responsive Design** | Mobile-first approach with Tailwind CSS | ✅ |
| **Dark Mode Support** | Toggle between light and dark themes | ✅ |
| **Modern UI** | Radix UI components for consistent design | ✅ |
| **Real-time Updates** | Live notifications and progress updates | ✅ |
| **Newsletter System** | Automated scheduling and management | ✅ |
| **Accessibility** | WCAG compliant with Radix UI primitives | ✅ |

---

## 🆕 Recent Security Enhancements (v1.15.5 - October 28, 2025)

### Enhanced Authentication & Security
- **🔐 JWT Security Hardening**: Removed hardcoded fallback secrets, enforced strong JWT configurations
- **🔒 Password Complexity**: Real-time password strength validation with visual feedback
- **🛡️ Rate Limiting**: Comprehensive brute force protection on all authentication endpoints
- **⚡ Environment Validation**: Startup validation for all security-critical environment variables
- **📊 Client-side Validation**: Interactive password strength indicator with requirements checklist

### Security Improvements Summary
| Security Layer | Enhancement | Impact |
|----------------|-------------|---------|
| **Authentication** | JWT secret validation, no fallback defaults | 🔴 Critical vulnerability fixed |
| **Password Policy** | 8+ chars, mixed case, numbers, special chars | 🟡 Security compliance improved |
| **Rate Protection** | 10 attempts/15min auth, 3 attempts/hour reset | 🟡 Brute force mitigation |
| **Environment Config** | Comprehensive validation on server startup | 🟢 Production readiness |
| **User Experience** | Real-time password feedback and validation | 🟢 Security awareness |

---

## 🧰 Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | React | 18.3 | Core UI framework |
| | Vite | Latest | Build tool and dev server |
| | JavaScript | ES6+ | Programming language |
| | Tailwind CSS | Latest | Utility-first CSS framework |
| | Radix UI | Latest | Accessible component primitives |
| **Backend** | Node.js | Latest | Runtime environment |
| | Express.js | Latest | Web application framework |
| | JavaScript | ES6+ | Programming language |
| **Database** | MongoDB Atlas | Latest | NoSQL database service |
| | Mongoose | Latest | Object Document Mapper (ODM) |
| **Caching** | Redis | Latest | In-memory data structure store |
| **Authentication** | JWT | Latest | JSON Web Tokens for auth |
| | Google OAuth 2.0 | Latest | Social login integration |
| | bcryptjs | Latest | Password hashing |
| **Payment** | PayPal SDK | Latest | Payment processing |
| **Media Storage** | Cloudinary | Latest | Cloud-based media management |
| **Email Service** | Nodemailer | Latest | Email sending service |
| **Testing** | Jest | Latest | JavaScript testing framework |
| | Supertest | Latest | HTTP assertion testing |
| **Security** | Helmet | Latest | Security headers middleware |
| | express-rate-limit | Latest | Rate limiting middleware |
| | Validator | Latest | Input validation and sanitization |

---

## � Recent Improvements (v1.15.4)

### Security Enhancements

| Improvement | Description | Impact | Status |
|-------------|-------------|---------|--------|
| **Fixed Critical JWT Security** | Removed hardcoded fallback secrets | High security risk eliminated | ✅ |
| **Password Complexity** | 8+ chars, uppercase, lowercase, numbers, special chars | Stronger user account protection | ✅ |
| **Rate Limiting** | Brute force attack prevention on auth endpoints | DDoS and attack protection | ✅ |
| **Input Validation** | XSS and injection attack prevention | Data integrity and security | ✅ |

### Development & Testing

| Improvement | Description | Benefits | Status |
|-------------|-------------|-----------|--------|
| **Jest Testing Framework** | 31+ comprehensive unit tests configured | Code reliability and quality assurance | ✅ |
| **Security Testing** | Input validation and auth testing suite | Security vulnerability detection | ✅ |
| **Model Validation** | Enhanced Course and Lecture schemas | Data integrity and validation | ✅ |
| **Code Quality** | Improved error handling across application | Better debugging and maintenance | ✅ |

### Database & Performance

| Improvement | Description | Performance Impact | Status |
|-------------|-------------|-------------------|--------|
| **Strategic Indexing** | Added indexes for common queries | Faster database operations | ✅ |
| **Virtual Properties** | Computed fields for better data access | Cleaner API responses | ✅ |
| **Utility Methods** | Common operation helpers in models | Code reusability | ✅ |

---

## �📂 Setup Instructions

### Installation & Setup Guide

| Step | Command | Description |
|------|---------|-------------|
| **1. Clone Repository** | `git clone https://github.com/Chirag-varu/EduCore.git` | Download project source code |
| | `cd EduCore` | Navigate to project directory |
| **2. Install Dependencies** | `chmod 700 setup.sh && bash setup.sh` | Install all dependencies (Linux/Mac) |
| | `npm run install-all` | Install all dependencies (Cross-platform) |
| **3. Environment Setup** | Create `.env` files in both `/server` and `/client` | Configure environment variables |
| **4. Database Seeding** | `npm run seed` | Populate database with sample data |
| **5. Start Development** | `chmod 700 run.sh && bash run.sh` | Start both client and server (Linux/Mac) |
| | `npm run dev` | Start both client and server (Cross-platform) |

### 🧪 Testing Commands

| Purpose | Command | Description |
|---------|---------|-------------|
| **Run All Tests** | `npm test` | Execute complete test suite (31+ tests) |
| **Watch Mode** | `cd server && npm run test:watch` | Run tests in watch mode for development |
| **Specific Tests** | `cd server && npm test -- auth.test.js` | Run specific test file |
| **Test Coverage** | `cd server && npm test -- --coverage` | Generate test coverage report |

### 🔧 Redis Setup (Required)

| Environment | Command | Description |
|-------------|---------|-------------|
| **Docker Setup** | `docker run --name redis -p 6379:6379 -d redis` | Create and start Redis container |
| **Start Redis** | `docker start redis` | Start existing Redis container |
| **Health Check** | `docker exec -it redis redis-cli ping` | Verify Redis is running |
| **Local Install** | `redis-server` | Start Redis if installed locally |

### 📜 Available Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `npm run dev` | Start development servers (client + server) | Root |
| `npm run build` | Build production version | Root |
| `npm run start` | Start production server | Root |
| `npm test` | Run server tests | Server |
| `npm run seed` | Populate database with sample data | Root |
| `npm run b:pt/mn/mj` | Bump version (patch/minor/major) | Root |

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

| Route Pattern | Purpose | Access Level |
|---------------|---------|--------------|
| `/api/v1/auth/*` | Authentication and user management | Public |
| `/api/v1/instructor/*` | Instructor-specific operations | Instructor |
| `/api/v1/student/*` | Student-specific operations | Student |
| `/api/v1/admin/*` | Admin panel operations | Admin |
| `/api/v1/chat/*` | Real-time messaging system | Authenticated |

---

## 🎯 Role-Based Access Control

| Role | Dashboard Route | Key Features | Permissions |
|------|----------------|--------------|-------------|
| **👨‍🎓 Student** | `/home` | Course browsing, enrollment, progress tracking | View courses, enroll, track progress |
| **👨‍🏫 Instructor** | `/instructor` | Course creation, student management, analytics | Create/edit courses, view student data |
| **🔧 Admin** | `/admin/newsletters` | User management, course moderation, system admin | Full system access, user management |

### 👨‍🎓 Student Features

| Feature | Description | Access |
|---------|-------------|--------|
| **Course Browser** | Browse and search available courses | ✅ Public |
| **Course Enrollment** | Enroll in courses with PayPal payment | 🔐 Student |
| **Progress Tracking** | Track learning progress and completion | 🔐 Student |
| **Video Lectures** | Watch course content and materials | 🔐 Enrolled |
| **Real-time Chat** | Communicate with instructors | 🔐 Student |
| **Course Materials** | Download course resources and materials | 🔐 Enrolled |

### 👨‍🏫 Instructor Features

| Feature | Description | Access |
|---------|-------------|--------|
| **Course Creation** | Create and manage course content | 🔐 Instructor |
| **Video Upload** | Upload and manage video lectures | 🔐 Instructor |
| **Student Management** | Monitor enrolled students and progress | 🔐 Instructor |
| **Analytics Dashboard** | View course performance and engagement | 🔐 Instructor |
| **Student Communication** | Respond to student queries and messages | 🔐 Instructor |

### 👨‍💼 Admin Features

| Feature | Description | Access |
|---------|-------------|--------|
| **User Management** | Manage all users (students, instructors) | 🔐 Admin |
| **Course Moderation** | Approve/reject instructor course submissions | 🔐 Admin |
| **Newsletter System** | Send announcements and newsletters | 🔐 Admin |
| **System Analytics** | Monitor platform-wide metrics and performance | 🔐 Admin |
| **Platform Settings** | Configure system-wide settings and policies | 🔐 Admin |

---

## 📊 Project Overview

| Metric | Details |
|--------|---------|
| **Total Test Coverage** | 31+ passing tests across 4 test suites |
| **Security Score** | ✅ All critical vulnerabilities resolved |
| **Code Quality** | ES6+ with comprehensive error handling |
| **Performance** | Redis caching + MongoDB indexing |
| **Scalability** | Microservices-ready architecture |
| **Browser Support** | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **Mobile Support** | Fully responsive design with Tailwind CSS |
| **Accessibility** | WCAG compliant with Radix UI components |

## 🌐 Deployment Information

| Environment | Status | URL |
|-------------|--------|-----|
| **Development** | ✅ Active | `http://localhost:5173` (Client) |
| | | `http://localhost:5000` (Server) |
| **Production** | � Coming Soon | TBD |
| **Testing** | ✅ Active | Local Jest environment |

---

## 📄 License & Contributing

| Aspect | Details |
|--------|---------|
| **License** | [MIT License](LICENSE) |
| **Author** | Chirag Varu |
| **Repository** | [GitHub - EduCore](https://github.com/Chirag-varu/EduCore) |
| **Issues** | [Report Issues](https://github.com/Chirag-varu/EduCore/issues) |
| **Contributing** | Contributions welcome! Please fork and submit PRs |
| **Code of Conduct** | Professional and respectful collaboration |

### 🤝 How to Contribute

| Step | Action | Description |
|------|--------|-------------|
| **1** | Fork the repository | Create your own copy |
| **2** | Create feature branch | `git checkout -b feature/amazing-feature` |
| **3** | Commit changes | `git commit -m 'Add amazing feature'` |
| **4** | Push to branch | `git push origin feature/amazing-feature` |
| **5** | Open Pull Request | Submit for review |

---

### 🏆 **EduCore v1.15.4 - Enterprise-Ready LMS with Enhanced Security**

*Built with ❤️ by [Chirag Varu](https://github.com/Chirag-varu) - A comprehensive learning management system designed for modern education.*