# 🎓 School Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> A full-stack school administration dashboard built with React, Express, Prisma, PostgreSQL, and Supabase.

---

## 📸 Preview

Add a dashboard screenshot here to showcase the application.

*Future path suggested: `docs/screenshots/dashboard.png`*

---

## ✨ Features

- **Classroom Overview**: Real-time display of classrooms with enrollment count and details.
- **Dedicated Class Records View**: Drill down into any class to see all enrolled student records (ID, Name, Status/Data) without truncation.
- **Student Registration**: Add new students directly to a class by providing a Student Code, Name, and Status/Data.
- **Dynamic Multi-Class Enrollment**: Reuse existing student records across multiple classes using their unique `studentCode` without database duplication.
- **Student Update**: Modify student names and status/data fields dynamically.
- **Class-Specific Unenrollment**: Unenroll a student from a specific class (deletes only the mapping relationship, leaving the student record intact).
- **Global Student Directory**: View a unique list of all registered students in the system.
- **Analytics View**: Visual summary of class sizes and database business constraint metrics.
- **Real-Time Connectivity Status**: Real-time backend status checker indicator (Connected / Disconnected).

---

## 🧠 Business Rules

The backend dynamically validates all operations in transactional blocks before committing updates. The following constraints must be met:
1. **Minimum Class Size**: Every class must maintain at least **5 enrolled students**.
2. **Generic Overlap Threshold**: Every class must contain at least **2 students** who are also enrolled in at least one other class (shared student check).
3. **Unique Student Codes**: Students are uniquely identified by `studentCode` (mapped to `id` on the frontend).
4. **Relationship Preservation**: Unenrolling a student deletes only the Class-Student relationship (`ClassStudent`), preserving the master `Student` record.
5. **Conflict Protection**: Prevents enrolling a student code with a name different from the existing record.
6. **Transaction Guarantee**: Database mutations are executed inside Prisma transactions; any business rule violation triggers an automatic rollback to guarantee data integrity.

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

## 🏗️ Architecture

```
React Frontend
      ↓ (Axios / REST API)
Express.js Backend
      ↓ (Prisma ORM)
PostgreSQL Database (Supabase)
```

The database structures a many-to-many relationship using a join table:
```
Class (1) ← (many) ClassStudent (many) → (1) Student
```

---

## 🗄️ Database Schema

### Entity-Relationship Model (Prisma DSL)
- **School**: Stores the institutional settings.
- **Class**: Represents individual classrooms linked to a School.
- **Student**: Holds unique student records identified by `studentCode`.
- **ClassStudent**: Join table storing the relationship link between classes and students.

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
| **GET** | `/api/school` | Get school name, classes, and enrolled students |
| **GET** | `/api/classes` | Get all classrooms |
| **GET** | `/api/classes/:classId` | Get class details by ID |
| **GET** | `/api/classes/:classId/students` | Get students enrolled in a specific class |
| **POST** | `/api/students` | Enroll a new student or link an existing student to a class |
| **PUT** | `/api/students/:studentCode` | Update name and/or status data of a student |
| **DELETE** | `/api/classes/:classId/students/:studentId` | Unenroll a student from a specific class |

---

## 🌱 Database Seeding

The database is populated with realistic academic data containing realistic Indian names (such as *Aarav Sharma* or *Ananya Singh*) and activity statuses. It generates:
- Class 1: ~30 students
- Class 2: ~35 students
- Class 3: ~32 students
- Overlapping students linking across different classes to satisfy the minimum of 2 shared students constraint.

Seeding is run via:
```bash
npx prisma db seed
```

---

## 🛡️ Backend Validation Example

If you attempt to unenroll a student which would drop that class's total enrollment count to `4` (violating the minimum size limit of 5), the controller catches this constraint failure inside the transaction, throws a validation error, and rolls back the database. The client receives a `400 Bad Request` with:
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
Copy `.env.example` to `.env`:
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

Configure the environment variables in `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:6543/DATABASE_NAME?pgbouncer=true"
DIRECT_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
```

Apply database migrations and seed data:
```bash
npx prisma db push
npx prisma db seed
```
Run the development server:
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
- Database error logs are safely structured in controllers to avoid exposing server credentials.
- Business constraint rules are enforced strictly server-side inside transactional blocks.

---

## 🔮 Future Improvements
- **Authentication**: Implementing JWT-based authentication and role-based access control.
- **Search & Filter**: Adding robust search capabilities to the global directory list.
- **Pagination**: Incorporate database paging for large class lists.
- **Automated Testing**: Integrating Jest and Supertest suites for endpoint coverage.

---

## 👩‍💻 Author

**Ayesha Topiwala**
- GitHub: [@ayesha-devx](https://github.com/ayesha-devx)
