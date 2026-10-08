# Project Management System

A full-stack Project Management System with **Web, Mobile, REST API, and Database** integration.

The system allows users to register, authenticate, create and manage projects, organize tasks, track progress, and view dashboard statistics.

Both the web and mobile applications use the **same backend API and database**.

---

## Features

### Authentication

- User registration
- User login
- User logout
- JWT authentication
- Secure password hashing using bcrypt
- Protected API routes
- User-level authorization
- Persistent authentication until logout/token expiration

### Project Management

- Create projects
- View projects
- View project details
- Edit projects
- Delete projects
- Project status tracking
- Project start and end dates
- Search projects
- Filter projects by status

### Task Management

- Create tasks
- View tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed
- Task priority
- Task status
- Due dates
- Search tasks
- Filter tasks by status
- Filter tasks by priority

### Dashboard

The dashboard displays:

- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Projects In Progress

### Security

- JWT authentication
- bcrypt password hashing
- Zod input validation
- Protected routes
- User-level authorization
- Rate limiting on authentication endpoints
- Prisma ORM for database access
- Centralized error handling

### Additional Features

- Swagger/OpenAPI documentation
- Automated API/integration tests
- Docker support
- Responsive web interface
- React Native mobile application
- Secure mobile token storage using Expo SecureStore

---

# Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- JWT
- bcrypt
- Zod
- Swagger/OpenAPI
- Jest

## Web

- React
- TypeScript
- Vite
- Tailwind CSS

## Mobile

- React Native
- Expo
- TypeScript
- Expo SecureStore

## DevOps

- Docker
- Docker Compose
- Git / GitHub

---

# Project Structure

```text
project-management-system/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── docs/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── types/
│   │
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── web/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
│
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── screens/
│   │   └── storage/
│   ├── App.tsx
│   ├── app.json
│   └── package.json
│
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git
- Expo CLI / Expo Go for mobile development
- Docker (optional)

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
```

A template is provided at:

```text
backend/.env.example
```

### Important

The actual `.env` file should **never be committed to GitHub**.

It is excluded using `.gitignore`.

---

# Database Setup

The project uses **SQLite with Prisma ORM**.

From the backend directory:

```bash
npx prisma generate
```

Run the database migration:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npm run prisma:seed
```

The Prisma schema is located at:

```text
backend/prisma/schema.prisma
```

Database documentation:

[Database Schema & ER Diagram](DATABASE_SCHEMA.md)

---

# Running the Backend

Start the backend development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000/api
```

Swagger documentation:

```text
http://localhost:5000/api/docs/
```

---

# Web Application Setup

Open a new terminal.

Navigate to the web directory:

```bash
cd web
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The web application will normally be available at:

```text
http://localhost:5173
```

---

# Mobile Application Setup

Navigate to the mobile directory:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

For a physical Android device, the mobile application must be able to reach the backend over the local network.

The API URL should point to the computer running the backend.

Example:

```text
http://YOUR_LOCAL_IP:5000/api
```

For example:

```text
http://192.168.1.10:5000/api
```

The phone and development computer should be connected to the same network.

---

# API Documentation

Complete API documentation is available in:

[API_DOCUMENTATION.md](API_DOCUMENTATION.md)

The API includes:

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Projects

```text
GET    /api/projects
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
```

### Tasks

```text
GET    /api/tasks
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

### Dashboard

```text
GET /api/dashboard
```

For request bodies, authentication requirements, validation, security details, and examples, see:

[API Documentation](API_DOCUMENTATION.md)

---

# Database Schema

The application uses the following main entities:

```text
User
  |
  | 1 : N
  |
Project
  |
  | 1 : N
  |
Task
```

### User

Stores registered users.

### Project

Stores projects belonging to users.

### Task

Stores tasks belonging to projects.

Full schema and relationships:

[Database Schema & ER Diagram](DATABASE_SCHEMA.md)

---

# Testing

The backend includes automated API/integration tests.

From the backend directory:

```bash
npm test
```

The test suite covers authentication, protected routes, projects, tasks, dashboard functionality, validation, authorization, and error handling.

---

# Production Build

## Backend

Build the TypeScript backend:

```bash
npm run build
```

The compiled backend is generated in:

```text
backend/dist/
```

## Web

Build the React application:

```bash
cd web
npm run build
```

The production build is generated in:

```text
web/dist/
```

---

# Docker

The project includes Docker configuration.

Build and start the services:

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

---

# Architecture

The overall system architecture is:

```text
                     ┌──────────────────┐
                     │   React Web App  │
                     └────────┬─────────┘
                              │
                              │ REST API
                              │
                     ┌────────▼─────────┐
                     │ Express Backend  │
                     │   REST API       │
                     └────────┬─────────┘
                              │
                       Prisma ORM
                              │
                     ┌────────▼─────────┐
                     │ SQLite Database  │
                     └──────────────────┘
                              ▲
                              │
                              │ REST API
                              │
                     ┌────────┴─────────┐
                     │ React Native     │
                     │ Mobile App       │
                     └──────────────────┘
```

The web and mobile applications use the same backend and database.

---

# Authentication Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Express Authentication API
 │
 ▼
JWT Token
 │
 ├──────────────► Web Application
 │
 └──────────────► Mobile Application
                         │
                         ▼
                   Secure Storage
```

Protected API requests include the JWT token:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# Security

The project implements the following security practices:

- Password hashing using bcrypt
- JWT authentication
- Protected API routes
- User-level authorization
- Zod request validation
- Authentication rate limiting
- ORM-based database access
- Centralized error handling
- Sensitive environment variables excluded from Git
- Secure token storage on mobile

Users cannot access or modify projects and tasks belonging to other users.

---

# Error Handling

The backend uses centralized error-handling middleware.

Common API responses include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

---

# API Documentation

Interactive Swagger/OpenAPI documentation:

```text
http://localhost:5000/api/docs/
```

Detailed API documentation:

[API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

# Database Documentation

Database schema and ER diagram:

[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

# Submission Deliverables

This repository contains:

- Web application
- Mobile application
- Backend REST API
- Database schema
- ER diagram
- API documentation
- README
- Automated tests
- Docker configuration
- Environment variable template

Deployment URLs and mobile distribution links will be added here after deployment.

---

# License

This project was developed as part of a Full Stack Developer technical assessment.