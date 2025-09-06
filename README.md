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

### we also added redis so u may have to run it in another terminal:

you can install or download it to ur local space but we recommend using docker in local and prod enviroment

```bash
docker run --name redis -p 6379:6379 -d redis
docker start redis
```

to ckeck if it running:

```bash
docker exec -it redis redis-cli ping
```

⚙️ Project Structure
```bash
EduCore/
├── client/    → Vite + React + TS + Tailwind (frontend)
└── server/    → Node + Express + TS (backend)
```

## Live Link: (comming soon...) (MVP Deployment)

---

## **License** 📜
This project is licensed under the [MIT License](LICENSE).
You are free to use, modify, and distribute this software with proper attribution.
---