# School Management System

A professional academic dashboard platform to manage classrooms, student profiles, and multi-class student enrollments dynamically. Built with a React (Vite, Tailwind CSS) frontend, an Express Node.js backend, and a PostgreSQL database mapped via Prisma ORM.

## Project Structure

```
school-management/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── data/
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── index.html
│
├── .gitignore
└── README.md
```

## Features

- **Classroom Overview**: Monitor cohorts, enrollment metrics, and student distribution in real-time.
- **Dedicated Class Records View**: Drill down into any class to see all enrolled student records, student codes, and individual activities.
- **Interactive Student Registration Modal**: Enroll new students by supplying a code, name, and status/activity description.
- **Dynamic Multi-Class Enrollment**: Reuse student profiles across multiple classrooms by mapping them using their unique `studentCode` instead of duplicating entity records.
- **Class-Specific Unenrollment**: Seamlessly unenroll a student from a specific class profile without globally deleting the primary student entity.
- **Inline Student Updates**: Edit a student's name and status dynamically.
- **Global Student Directory**: View unique student profiles registered across the whole school system.
- **Analytics View**: Visual analysis of classroom sizes and system constraints.

## Business & Integrity Rules

The backend dynamically validates all operations in transactional blocks before committing updates. The following constraints must be met:
1. **Minimum Class Size**: Every class must maintain at least **5 enrolled students**.
2. **Generic Overlap Threshold**: Every class must contain at least **2 students** who are also enrolled in at least one other class (shared student check).

*Database operations will automatically roll back inside transactional constraints if a registration or unenrollment would violate these limits.*

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide icons
- **Backend**: Node.js, Express, Cors
- **Database**: PostgreSQL (Supabase / Neon)
- **ORM**: Prisma (v7+)

---

## Setup & Run Instructions

### 1. Database Setup
Create a PostgreSQL database (e.g. on Supabase or Neon).

### 2. Backend Setup
1. Open the `/backend` directory.
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Populate `.env` with your real database credentials:
   - `DATABASE_URL`: Connection string pointing to your transaction mode connection pooler (e.g., pgbouncer port `6543`).
   - `DIRECT_URL`: Connection string pointing directly to the PostgreSQL database (port `5432`) to run migrations.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Apply database schema and migrations:
   ```bash
   npx prisma db push
   ```
6. Populate the database with realistic classroom data:
   ```bash
   npx prisma db seed
   ```
7. Launch backend server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5000`)*

### 3. Frontend Setup
1. Open the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5173`)*

4. Build production assets:
   ```bash
   npm run build
   ```

---

## REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/school` | Retrieves school metadata, classes, and enrolled students |
| **GET** | `/api/classes` | Retrieves details for all classes |
| **GET** | `/api/classes/:classId` | Retrieves a specific class by its ID |
| **GET** | `/api/classes/:classId/students` | Retrieves the list of students in a class |
| **POST** | `/api/students` | Enrolls a student (creates student if unique, otherwise links existing profile) |
| **PUT** | `/api/students/:studentCode` | Updates name and status metadata for a specific student code |
| **DELETE**| `/api/classes/:classId/students/:studentId` | Unenrolls a student from a specific class (preserves student record) |

---

## Security Note

All `.env` configuration files containing active database credentials, connection URLs, and session secrets are ignored from Git tracking by `.gitignore` to prevent credential leakage. Only safe `.env.example` templates with generic placeholders are committed.
