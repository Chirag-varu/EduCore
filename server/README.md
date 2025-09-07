
# EduCore Server

This directory contains the backend (server) for the EduCore application, built with **Node.js**, **Express**, and **MongoDB Atlas**. The backend provides RESTful APIs, authentication, business logic, and integrations for the EduCore platform.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Redis Setup](#redis-setup)
- [Scripts](#scripts)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```text
server/
├── controllers/         # Business logic for authentication, courses, students, instructors, etc.
├── helpers/             # Utility modules (e.g., cloudinary, PayPal, Redis)
├── middleware/          # Express middleware (e.g., authentication)
├── models/              # Mongoose schemas and models
├── routes/              # Express route definitions (API endpoints)
├── seed/                # Database seeding scripts
├── uploads/             # Temporary file storage for uploads
├── server.js            # Main entry point for the server
├── .env                 # Environment variables (see .env.example)
└── README.md            # Project documentation
```

The backend follows the **MVC (Model-View-Controller)** architecture for maintainability and scalability.

---

## Features

- User authentication (JWT-based)
- Instructor and student management
- Course creation, enrollment, and progress tracking
- Payment integration (PayPal)
- Media uploads (Cloudinary)
- Redis caching for performance
- Modular and extensible codebase

---

## Setup & Installation

1. **Clone the repository:**
	```bash
	git clone <your-repo-url>
	cd EduCore/server
	```

2. **Install dependencies:**
	```bash
	npm install
	```

3. **Configure environment variables:**
	- Copy `.env.example` to `.env` and fill in the required values (MongoDB URI, JWT secret, Cloudinary, PayPal, etc.).

---

## Environment Variables

Create a `.env` file in the `server/` directory. Reference `.env.example` for required variables:

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `CLOUDINARY_*` - Cloudinary API credentials
- `PAYPAL_*` - PayPal API credentials
- `REDIS_URL` - Redis connection string (if using remote Redis)

---

## Running the Server

To start the backend server in development mode:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5000).

---

## Redis Setup

Redis is used for caching and session management. You can run Redis locally or via Docker (recommended):

```bash
# Start Redis using Docker
docker run --name redis -p 6379:6379 -d redis
docker start redis

# Check if Redis is running
docker exec -it redis redis-cli ping
# Should return: PONG
```

---

## Scripts

- `npm run dev` - Start the server with nodemon for development
- `npm start` - Start the server in production mode
- `npm run seed` - Seed the database (if implemented)

---

## API Documentation

API documentation is available via route comments and (optionally) Swagger or Postman collections. For details, see the `routes/` and `controllers/` directories.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.