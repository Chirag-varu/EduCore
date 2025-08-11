# 📚 EduCore – Modern Learning Management System

**EduCore** is a web-based Learning Management System (LMS) designed to simplify online education for students and instructors. The platform provides essential features like course management, user authentication, and a responsive user experience tailored for both desktop and mobile environments.

---

## 🚧 Status

Project is currently in the initial development phase. The MVP features and UI components are being actively built.

---

## 📌 MVP Scope

- Browse available courses by category and tags  
- Student & Instructor authentication system  
- Instructor dashboard for managing courses, lessons, and assessments  
- Course enrollment and progress tracking  
- Lesson viewing with support for video, quizzes, and PDFs  
- Responsive UI with feedback support  

---

## 🧰 Tech Stack

**Frontend:** Vite, React, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express.js, TypeScript
**Database:** MongoDB Atlas
**Payment Gateway:** Stripe
**Authentication:** To be implemented (e.g., OAuth 2.0 )

---

## 📂 Setup Instructions

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

⚙️ Project Structure
```bash
EduCore/
├── client/    → Vite + React + TS + Tailwind (frontend)
└── server/    → Node + Express + TS (backend)
```

## Live Link: https://educore-oj6e.onrender.com/ (MVP Deployment)

---

## **License** 📜
This project is licensed under the [MIT License](LICENSE).
You are free to use, modify, and distribute this software with proper attribution.
---