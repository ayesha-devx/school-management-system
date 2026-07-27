# 🎓 School Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)

A professional, full-stack school administration panel built to monitor classroom cohorts, enrollments, and unique student distributions. Built with a React frontend, Node.js/Express backend, and a PostgreSQL database hosted on Supabase, the system interfaces via Prisma ORM and enforces database-level business integrity rules inside transactional mutations.

🌐 **Live Demo**: [https://school-management-system-puce-eight-71.vercel.app](https://school-management-system-puce-eight-71.vercel.app)  
⚡ **API Health**: [https://school-management-system-59vl.onrender.com/api/health](https://school-management-system-59vl.onrender.com/api/health)

---

## 🚀 Live Deployment

| Component | Platform | Technology | URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | React, Vite, Tailwind CSS | [Live Application](https://school-management-system-puce-eight-71.vercel.app) |
| **Backend API** | Render | Node.js, Express.js | [API Base Endpoint](https://school-management-system-59vl.onrender.com) |
| **Database** | Supabase | PostgreSQL (Prisma ORM) | Cloud Database Instance |


---

## 🏗️ Architecture

```
        React + Vite Frontend (Vercel)
                      |
                      | Axios / HTTPS REST API
                      v
        Node.js + Express Backend (Render)
                      |
                      | Prisma ORM
                      v
       PostgreSQL Database (Supabase Cloud)
```

The database structures a many-to-many relationship using a dedicated join table `ClassStudent`. This link connects the `Class` and `Student` records together while enforcing independent enrollments across multiple cohorts.

---

## 🗄️ Database Schema

The database entities are structured according to the following relationships:

```mermaid
erDiagram
  SCHOOL ||--o{ CLASS : has
  CLASS ||--o{ CLASS_STUDENT : contains
  STUDENT ||--o{ CLASS_STUDENT : enrolled_in

  SCHOOL {
    string id PK
    string name
    datetime createdAt
    datetime updatedAt
  }
  CLASS {
    string id PK
    string name
    string schoolId FK
    datetime createdAt
    datetime updatedAt
  }
  STUDENT {
    string id PK
    string studentCode UK
    string name
    string data
    datetime createdAt
    datetime updatedAt
  }
  CLASS_STUDENT {
    string id PK
    string classId FK
    string studentId FK
    datetime createdAt
    datetime updatedAt
  }
```

---

## ✨ Features

- **Classrooms Dashboard**: Displays real-time details of all school classes along with enrollment counts.
- **Detailed Classroom View**: Allows drilling down into any class to view all enrolled student records (ID, Name, Club/Status).
- **Student Registration**: Supports enrolling new students into a designated classroom cohort.
- **Shared Student Enrollment**: Enables enrolling an existing student into multiple classes via their unique `studentCode` without duplicate database entries.
- **Student Update**: Allows modifications to student names and custom status or data profiles.
- **Class-Specific Unenrollment**: Deletes the class-student relationship (`ClassStudent`) from the active classroom without deleting the student's master file (`Student`).
- **Global Student Directory**: Provides a consolidated, searchable database of every registered student.
- **Analytics View**: Visualizes key metrics like cohort size distributions and compliance checks.
- **Real-Time Backend Status Indicator**: Provides a live visual check of api connectivity (Connected / Disconnected).

---

## 🧠 Business Rules

All data operations are validated in transactional queries to maintain data sanity:
1. **Minimum Class Size**: Every class must maintain at least **5 enrolled students**. Actions that violate this rule are rolled back.
2. **Generic Overlap Threshold**: Every class must contain at least **2 students** who are also enrolled in at least one other class.
3. **Unique Student Codes**: Students are globally identified by their `studentCode`.
4. **Relationship Preservation**: Unenrolling a student deletes only the link (`ClassStudent`), leaving the master `Student` record intact.
5. **Conflict Protection**: Rejects registrations that attempt to reuse an existing `studentCode` with a different name.
6. **Transaction Guarantee**: Violations of business rules cause database transactions to roll back immediately.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Backend status verification |
| **GET** | `/api/school` | Fetch school details, classes, and nested cohorts |
| **GET** | `/api/classes` | Fetch all classes |
| **GET** | `/api/classes/:classId` | Fetch class metadata by ID |
| **GET** | `/api/classes/:classId/students` | Fetch students enrolled in a specific class |
| **POST** | `/api/students` | Enroll a new student or link an existing student to a class |
| **PUT** | `/api/students/:studentCode` | Update name and data of an existing student |
| **DELETE** | `/api/classes/:classId/students/:studentId` | Unenroll a student from a specific class |

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

## 🔑 Environment Variables

To run the application locally, set up the following files.

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:6543/DATABASE_NAME?pgbouncer=true"
DIRECT_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## ⚙️ Getting Started

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
Configure your credentials in `.env` (use `.env.example` as a template). 

Sync database schema and generate Prisma client:
```bash
npx prisma db push
```

Start backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file referencing the backend endpoint (e.g. `VITE_API_URL=http://localhost:5000/api`).

Start frontend:
```bash
npm run dev
```

---

## 🌱 Database Seeding

The seed script initializes the database with mock cohorts containing unique Indian student names and structural class-student links.

To run seeding, run:
```bash
npx prisma db seed
```

---

## ☁️ Deployment

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Environment Variable**: `VITE_API_URL` (Points to Render API, e.g. `https://school-management-system-59vl.onrender.com/api`)

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma migrate deploy`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string (pooled/transaction mode)
  - `DIRECT_URL`: Connection string (direct/session mode)
  - `FRONTEND_URL`: URL of the deployed Vercel application

---

## 🔒 Security
- All sensitive keys and credentials are safe-kept inside environment variables (excluded via `.gitignore`).
- Operations are validated on the server inside Prisma database transactions.
- CORS policies limit cross-origin requests specifically to the configured `FRONTEND_URL` origin.

---

## 👩‍💻 Author

**Ayesha Topiwala**  
*Computer Engineering Student & Full-Stack Web Developer*

- **GitHub**: [@ayesha-devx](https://github.com/ayesha-devx)  
- **LinkedIn**: [Ayesha Topiwala](https://www.linkedin.com/in/ayesha-topiwala-b70a20369)  
- **Portfolio**: [ayesha-portfolio-rkf9.vercel.app](https://ayesha-portfolio-rkf9.vercel.app)

---

Built with React, Node.js, Express, Prisma and PostgreSQL.

⭐ *If you found this project useful, consider starring the repository.*
