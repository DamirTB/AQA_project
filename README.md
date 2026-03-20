# Exam Preparation Platform

A full-stack web application for online exam preparation built with Vue.js 3, Express, TypeScript, and MongoDB.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript, Vite, Vue Router, Pinia
- **Backend**: Express + TypeScript, Mongoose
- **Database**: MongoDB 7
- **Auth**: JWT (JSON Web Tokens)
- **Containerization**: Docker + Docker Compose

## Quick Start (Docker)

The easiest way to run the application is with Docker Compose:

```bash
docker-compose up --build
```

This starts three containers:

| Service    | URL                     | Description           |
|------------|-------------------------|-----------------------|
| Frontend   | http://localhost:8080   | Vue.js SPA (nginx)   |
| Backend    | http://localhost:3000   | Express REST API      |
| MongoDB    | localhost:27017         | Database              |

The database is automatically seeded with 2 exams and 20 questions on first startup.

To stop everything:

```bash
docker-compose down
```

To stop and wipe the database:

```bash
docker-compose down -v
```

## Local Development (without Docker)

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
npm install
npm run dev
```

The API server starts on http://localhost:3000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on http://localhost:5173 with API proxy to port 3000.

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth (no token required)

| Method | Endpoint          | Body                                  | Description           |
|--------|-------------------|---------------------------------------|-----------------------|
| POST   | `/api/auth/register` | `{ username, email, password }`    | Register a new user   |
| POST   | `/api/auth/login`    | `{ email, password }`              | Login, returns JWT    |

### Exams (token required)

| Method | Endpoint          | Description                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | `/api/exams`      | List all exams with question counts              |
| GET    | `/api/exams/:id`  | Get exam detail with questions (answers hidden)  |

### Attempts (token required)

| Method | Endpoint                  | Body                              | Description                       |
|--------|---------------------------|-----------------------------------|-----------------------------------|
| POST   | `/api/attempts/start`     | `{ examId }`                      | Start or resume an exam attempt   |
| POST   | `/api/attempts/submit`    | `{ attemptId, answers }`          | Submit answers, get score         |
| GET    | `/api/attempts/:id/result`| -                                 | Get detailed result with breakdown|
| GET    | `/api/attempts/history`   | -                                 | Get user's attempt history        |

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": ["Optional array of validation details"]
}
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Validation error               |
| 401    | Missing or invalid token       |
| 404    | Resource not found             |
| 409    | Duplicate (email/username)     |
| 500    | Internal server error          |

## Pages

| Route             | Page          | Description                           |
|-------------------|---------------|---------------------------------------|
| `/register`       | Register      | Create a new account                  |
| `/login`          | Login         | Sign in with email and password       |
| `/dashboard`      | Dashboard     | Exam history and scores               |
| `/exams`          | Exam List     | Browse available exams                |
| `/exams/:id`      | Exam Detail   | View exam info before starting        |
| `/attempt/:id`    | Exam Attempt  | Answer questions with countdown timer |
| `/results/:id`    | Results       | Score and per-question breakdown      |

## Seed Data

Two exams are pre-loaded:

1. **JavaScript Fundamentals** - 10 questions, 15 minute time limit
2. **Web Development Basics** - 10 questions, 20 minute time limit

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose models (User, Exam, Question, Attempt)
│   │   ├── routes/        # Express route handlers
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── seed/          # Database seed data
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Entry point, DB connection
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── views/         # Page components
│   │   ├── router/        # Vue Router config
│   │   ├── stores/        # Pinia auth store
│   │   ├── api/           # Axios HTTP client
│   │   ├── App.vue        # Root component with navbar
│   │   └── main.ts        # Vue app entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```
