# School Result System - Backend Setup & Usage Guide

## Overview
This is the backend API for the School Result System, built with Node.js, Express, and PostgreSQL. It provides endpoints for authentication, CRUD operations for admin management, and result tracking for students and teachers.

## Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or pnpm

## Installation

### 1. Install Dependencies
```bash
cd backend
pnpm install
# or
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_results_db
DB_USER=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Create PostgreSQL Database
Open a PostgreSQL terminal and create the database:
```sql
CREATE DATABASE school_results_db;
```

### 4. Initialize Database Schema
Run all SQL files to create tables and set up triggers:
```bash
# Connect to your database and run these SQL files in order:
psql -U postgres -d school_results_db -f sql/users_table.sql
psql -U postgres -d school_results_db -f sql/classes_subjects_tables.sql
psql -U postgres -d school_results_db -f sql/teachers_students_assignments_tables.sql
psql -U postgres -d school_results_db -f sql/results_table.sql
```

### 5. Seed Database with Test Data
Populate the database with test users and data:
```bash
node seed.js
```

This will create:
- 1 Admin user (username: admin, password: admin123)
- 3 Teachers (username: teacher1/2/3, password: teacher123)
- 3 Students (username: student1/2/3, password: student123)
- 3 Classes (10-A, 10-B, 11-A)
- 4 Subjects (Math, English, Science, History)
- Teacher assignments and sample results

## Running the Server

### Development Mode (with auto-reload)
```bash
pnpm dev
# or
npm run dev
```

### Production Mode
```bash
pnpm start
# or
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Health Check
- `GET /health` - Check database and API status

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Register new user (admin only)

### Admin Management (Protected with Admin Role)
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create new teacher (creates user + teacher record)
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher (cascades to user)

- `GET /api/students` - List all students
- `POST /api/students` - Create new student (creates user + student record)
- `GET /api/students/:id` - Get student details
- `GET /api/students/class/:classId` - List students by class
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (cascades to user)

- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Teacher Operations (Protected with Teacher Role)
- `GET /api/assignments/teacher/me` - Get logged-in teacher's assignments
- `POST /api/results` - Submit/update results
- `PUT /api/results` - Update results
- `GET /api/results/class/:classId/subject/:subjectId/:year` - Get class results by subject

### Student Operations (Protected with Student Role)
- `GET /api/results/student/me/:academicYear` - Get personal results

## Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Login as Teacher
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "teacher123"
  }'
```

### Login as Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "student123"
  }'
```

### Get Classes (Admin - requires token)
```bash
curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Project Structure
```
backend/
├── config/
│   └── db.js              # Database connection pool
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── classesController.js
│   ├── subjectsController.js
│   ├── teachersController.js
│   ├── studentsController.js
│   ├── assignmentsController.js
│   └── resultsController.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── classesRoutes.js
│   └── ... (other routes)
├── middleware/           # Express middleware
│   ├── checkAuth.js      # JWT verification
│   ├── checkAdmin.js     # Admin role check
│   ├── checkTeacher.js   # Teacher role + authorization
│   └── checkStudent.js   # Student role check
├── sql/                  # Database schema files
│   ├── users_table.sql
│   ├── classes_subjects_tables.sql
│   ├── teachers_students_assignments_tables.sql
│   └── results_table.sql
├── server.js             # Express app setup
├── seed.js               # Database seeding script
├── package.json
└── .env.example
```

## Database Schema

### Users Table
Base user table with roles (admin, teacher, student)

### Classes Table
- name (e.g., "Class 10-A")
- grade_level (1-12)
- academic_year (e.g., "2024-2025")

### Subjects Table
- name (e.g., "Mathematics")
- code (unique, e.g., "MATH")
- description

### Teachers Table
- Linked to users table via user_id
- employee_id (unique)
- specialization
- qualification
- experience_years
- hire_date

### Students Table
- Linked to users table via user_id
- student_id (unique)
- class_id (foreign key)
- date_of_birth
- parent_name, parent_phone, parent_email
- enrollment_date

### Teacher Assignments Table
- Manages which teachers teach which subjects in which classes
- Unique constraint: (teacher_id, subject_id, class_id, academic_year)

### Results Table
- student_id, subject_id, teacher_id (foreign keys)
- Scores: first_monthly, second_monthly, midterm_exam, third_monthly, fourth_monthly, final_exam
- Computed columns: term_1_total, term_2_total

## Authorization Rules

### Admin
- Can access all management endpoints
- Can create/update/delete classes, subjects, teachers, students, and assignments

### Teacher
- Can view own assignments (GET /api/assignments/teacher/me)
- Can submit results only for students in their assigned classes/subjects
- Authorization is enforced via checkTeacher middleware
- Can access students' results for their assigned subject/class combinations

### Student
- Can only view their own results (GET /api/results/student/me/:academicYear)
- Cannot access other students' data

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Ensure database exists: `CREATE DATABASE school_results_db;`

### JWT Token Error
- Ensure JWT_SECRET is set in .env
- Tokens expire after 24 hours by default
- Include token in Authorization header: `Authorization: Bearer <token>`

### Port Already in Use
- Change PORT in .env (default 5000)
- Or kill the process using port 5000

### Seeding Issues
- Ensure database schema is initialized (run all SQL files first)
- Clear existing data: `TRUNCATE TABLE results CASCADE;` etc.
- Check that bcryptjs is installed

## Notes
- Passwords are hashed using bcryptjs before storage
- JWT tokens include userId and role in the payload
- All timestamps use CURRENT_TIMESTAMP with automatic updated_at triggers
- Cascading deletes are configured for referential integrity
