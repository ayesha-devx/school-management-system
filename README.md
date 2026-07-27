# 🎓 School Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A professional, full-stack school management panel designed to monitor classroom cohorts, enrollments, and unique student distributions. Built with a React frontend, Node.js/Express backend, and a PostgreSQL database hosted on Supabase, the system interfaces via Prisma ORM and enforces database-level business integrity rules inside transactional mutations.

---

## 🏗️ Architecture

```
React Frontend
      ↓ (Axios / REST API)
Express Routes & Controllers
      ↓ (Prisma ORM)
PostgreSQL Database (Supabase)
```

The database structures a many-to-many relationship using a join table:
```
Class (1) ← (many) ClassStudent (many) → (1) Student
```

---

## ✨ Features

- **Classrooms Dashboard**: Real-time display of classrooms with enrollment totals.
- **Detailed Classroom View**: Drill down into any class to see all enrolled student records (Student ID, Name, Status/Data) without truncation.
- **Student Registration**: Register and enroll new students into a target class.
- **Shared Student Enrollment**: Reuse existing student records across multiple classes using their unique `studentCode` without database duplication.
- **Student Update Option**: Modify student names and status/data fields dynamically.
- **Class-Specific Unenrollment**: Remove a student from a specific class (deletes the mapping relationship, leaving the master student record intact).
- **Global Student Directory**: Unique, aggregate list of all registered students in the system.
- **Analytics View**: Visual summary of class sizes and database constraint compliance metrics.
- **Real-Time Status Indicator**: Live backend status checker (Connected / Disconnected).

---

## 🧠 Business Rules

The backend validates all mutations in transactions before committing updates. The following constraints must be met:
1. **Minimum Class Size**: Every class must maintain at least **5 enrolled students**.
2. **Generic Overlap Threshold**: Every class must contain at least **2 students** who are also enrolled in at least one other class (shared student check).
3. **Unique Student Codes**: Students are uniquely identified by `studentCode` (mapped to `id` on the frontend).
4. **Relationship Preservation**: Unenrolling a student deletes only the Class-Student relationship (`ClassStudent`), preserving the master `Student` record.
5. **Conflict Protection**: Enrolling a student code with a name different from the existing record is rejected.
6. **Transaction Guarantee**: Any business rule violation triggers an automatic rollback of the transaction to guarantee data integrity.

---

## 🗄️ Database Schema

The PostgreSQL schema is managed via Prisma and models the following entities:

```mermaid
erDiagram
  School {
    string id PK
    string name
    datetime createdAt
    datetime updatedAt
  }
  Class {
    string id PK
    string name
    string schoolId FK
    datetime createdAt
    datetime updatedAt
  }
  Student {
    string id PK
    string studentCode UK
    string name
    string data
    datetime createdAt
    datetime updatedAt
  }
  ClassStudent {
    string id PK
    string classId FK
    string studentId FK
    datetime createdAt
    datetime updatedAt
  }

  School ||--o{ Class : "has"
  Class ||--o{ ClassStudent : "contains"
  Student ||--o{ ClassStudent : "enrolled"
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Lucide React Icons, Axios |
| **Backend** | Node.js, Express.js, CORS |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Database Hosting** | Supabase |
| **API Architecture** | REST |

---

## 📁 Project Structure

```
school-management/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   │   └── schoolController.js
│   │   ├── routes/
│   │   │   ├── healthRoutes.js
│   │   │   └── schoolRoutes.js
│   │   ├── services/
│   │   │   └── schoolService.js
│   │   ├── lib/
│   │   │   └── prisma.js
│   │   ├── data/
│   │   │   └── schoolData.js
│   │   └── app.js
│   ├── .env.example
│   ├── prisma.config.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClassCard.jsx
│   │   │   ├── Header.jsx
│   │   │   └── StudentTable.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── schoolService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| **GET** | `/api/health` | Health check endpoint |
| **GET** | `/api/school` | Get school details, classes, and enrolled students |
| **GET** | `/api/classes` | Get all classrooms |
| **GET** | `/api/classes/:classId` | Get class details by ID |
| **GET** | `/api/classes/:classId/students` | Get students enrolled in a specific class |
| **POST** | `/api/students` | Enroll a new student or link an existing student to a class |
| **PUT** | `/api/students/:studentCode` | Update name and/or status data of a student |
| **DELETE** | `/api/classes/:classId/students/:studentId` | Unenroll a student from a specific class |

---

## 🌱 Database Seeding

The seed script (`backend/prisma/seed.js`) populates the database with realistic academic data containing unique Indian names and club memberships, mapping to the following targets:
- **Class 1**: ~30 students
- **Class 2**: ~35 students
- **Class 3**: ~32 students
- **Overlapping Students**: Creates students shared across multiple classes to satisfy the generic overlap rule.

Execute seeding using:
```bash
npx prisma db seed
```

---

## 🛡️ Backend Validation Example

If unenrolling a student from a class drops the class size to `4` (violating the minimum limit of 5), the controller rejects the request inside a transaction, rolls back the query, and returns a `400 Bad Request`:
```json
{
  "success": false,
  "message": "Validation failed: Class \"Class 1\" must contain a minimum of 5 students."
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL Database Instance (Supabase or Neon)

### 1. Clone Repository
```bash
git clone https://github.com/ayesha-devx/school-management-system.git
cd school-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Configure your environment file:
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

Edit `.env` and configure your credentials:
```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:6543/DATABASE_NAME?pgbouncer=true"
DIRECT_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
```

Sync database and run seeding:
```bash
npx prisma db push
npx prisma db seed
```
Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Description |
|:---|:---|
| **PORT** | The port the backend server listens to (defaults to 5000) |
| **DATABASE_URL** | PostgreSQL connection pooler URL (Transaction Mode) |
| **DIRECT_URL** | Direct connection URL to database for migrations (Session Mode) |

> [!IMPORTANT]
> Never commit `.env` files. They are excluded through `.gitignore`. Use `.env.example` as the configuration template.

---

## 📜 Available Scripts

### Backend
- `npm run start`: Runs backend in production mode.
- `npm run dev`: Runs backend development server with hot-reload (nodemon).

### Frontend
- `npm run dev`: Starts local development server on Vite.
- `npm run build`: Compiles production assets.

---

## 🔒 Security
- Database connection details are excluded from Git using `.gitignore`.
- Database error handling is structured to avoid exposing credentials or internal traces.
- All structural mutations use transactions with strict server-side validation to ensure rollback on failure.

---

## 👩‍💻 Author

**Ayesha Topiwala**
- GitHub: [@ayesha-devx](https://github.com/ayesha-devx)
