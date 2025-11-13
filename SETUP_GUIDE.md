# School Result System - Complete Setup & Testing Guide

## System Overview

The School Result System is a full-stack web application for managing student results, teacher assignments, and administrative operations. It consists of:

- **Backend**: Node.js/Express API with PostgreSQL database
- **Frontend**: React (Vite) admin/teacher dashboard
- **Mobile**: React Native (Expo) student portal

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v14+) and npm/pnpm installed
- **PostgreSQL** (v12+) installed and running
- **Git** (for version control)
- A code editor (VS Code recommended)

## Complete Setup Instructions

### Step 1: Backend Setup

#### 1.1 Create PostgreSQL Database

Open PostgreSQL CLI (psql) and run:

```sql
CREATE DATABASE school_results_db;
```

#### 1.2 Navigate to Backend Directory

```bash
cd backend
```

#### 1.3 Install Dependencies

```bash
pnpm install
# or
npm install
```

#### 1.4 Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_results_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### 1.5 Initialize Database Schema

Run all SQL files to create tables (order matters):

```bash
# Using psql
psql -U postgres -d school_results_db -f sql/users_table.sql
psql -U postgres -d school_results_db -f sql/classes_subjects_tables.sql
psql -U postgres -d school_results_db -f sql/teachers_students_assignments_tables.sql
psql -U postgres -d school_results_db -f sql/results_table.sql
```

#### 1.6 Seed Database with Test Data

```bash
node seed.js
```

You should see output confirming creation of:
- 1 Admin user
- 3 Teachers
- 3 Students
- 3 Classes
- 4 Subjects
- Teacher assignments and sample results

#### 1.7 Start Backend Server

```bash
pnpm dev
# or
npm run dev
```

Server should run on `http://localhost:5000`

Verify with: `curl http://localhost:5000/health`

### Step 2: Frontend Setup

#### 2.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

#### 2.2 Install Dependencies

```bash
pnpm install
# or
npm install
```

#### 2.3 Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Frontend should run on `http://localhost:5173`

#### 2.4 Configure API Base URL

Check `frontend/src/services/api.js` to ensure it points to your backend:

```javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Step 3: Mobile Setup (Optional)

#### 3.1 Navigate to Mobile Directory

```bash
cd ../my-expo-app
```

#### 3.2 Install Dependencies

```bash
pnpm install
# or
npm install
```

#### 3.3 Start Expo

```bash
pnpm start
# or
npm start
```

Follow the Expo CLI prompts to run on Android/iOS emulator or physical device.

## Testing the System

### Test Credentials

After seeding, use these credentials to test different roles:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher 1 | teacher1 | teacher123 |
| Teacher 2 | teacher2 | teacher123 |
| Teacher 3 | teacher3 | teacher123 |
| Student 1 | student1 | student123 |
| Student 2 | student2 | student123 |
| Student 3 | student3 | student123 |

### Frontend Testing Checklist

#### Authentication Flow
- [ ] Navigate to `http://localhost:5173`
- [ ] Click "Admin: admin / admin123" quick access button
- [ ] Login should redirect to `/admin/dashboard`
- [ ] Verify welcome message shows correct username
- [ ] Logout button redirects to login page

#### Admin Dashboard
- [ ] Dashboard loads with statistics cards
- [ ] Statistics show correct counts (e.g., 3 Classes, 4 Subjects, etc.)
- [ ] Click on stat cards navigates to respective pages
- [ ] All quick access buttons work correctly

#### Admin Pages - Classes
- [ ] "Add New Class" button opens form
- [ ] Create new class with name, grade level, academic year
- [ ] View list of all classes
- [ ] Edit class details
- [ ] Delete class (with confirmation)

#### Admin Pages - Subjects
- [ ] Create new subject with name, code, description
- [ ] View all subjects
- [ ] Edit subject details
- [ ] Delete subject

#### Admin Pages - Teachers
- [ ] Create teacher with full details:
  - Username, password, email
  - First/last name
  - Employee ID, specialization, qualification
  - Experience years, hire date
- [ ] View teacher list
- [ ] Edit teacher information
- [ ] Delete teacher

#### Admin Pages - Students
- [ ] Create student linked to class:
  - Username, password, email
  - First/last name
  - Student ID, class, DOB
  - Parent info
- [ ] Filter students by class
- [ ] Edit student information
- [ ] Delete student

#### Admin Pages - Assignments
- [ ] Create assignment:
  - Select teacher, subject, class
  - Enter academic year
  - Click "Assign" button
- [ ] View all current assignments
- [ ] Delete assignment

#### Teacher Dashboard
- [ ] Login as teacher1
- [ ] Dashboard shows assigned classes/subjects
- [ ] Click "Manage Results" links
- [ ] Can select different class/subject combinations

#### Teacher Results Management
- [ ] Dropdowns show assigned classes and subjects
- [ ] When class/subject selected, fetch students
- [ ] Edit score fields for students
- [ ] Submit button saves results to database
- [ ] Scores display correctly for each student

### Backend Testing Checklist

#### Health Check
```bash
curl http://localhost:5000/health
# Expected: {"status":"ok","db":"connected"}
```

#### Authentication
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response includes JWT token and user info
```

#### Classes API
```bash
# Get all classes (using token from login)
curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create new class
curl -X POST http://localhost:5000/api/classes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Class 12-A","grade_level":12,"academic_year":"2024-2025"}'
```

#### Students API
```bash
# Get students in a specific class (classId = 1)
curl -X GET http://localhost:5000/api/students/class/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Results API
```bash
# Get student's own results
curl -X GET "http://localhost:5000/api/results/student/me/2024-2025" \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"

# Expected: Results with calculations (term totals, annual average)
```

### Mobile Testing Checklist (if running Expo)

- [ ] Launch Expo app on emulator/device
- [ ] Login screen displays
- [ ] Test credentials work
- [ ] Token persists after login
- [ ] Results screen displays personal results
- [ ] Grand totals and per-subject breakdown visible
- [ ] Can select different academic years

## Troubleshooting

### Database Connection Failed

**Problem**: "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Solutions**:
1. Verify PostgreSQL is running: `psql --version`
2. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in `.env`
3. Ensure database exists: `psql -l`
4. If using different DB user: Update connection string

### Port 5000 Already in Use

**Solution**: Change PORT in `.env`:
```env
PORT=5001
```

Then update CORS_ORIGIN in frontend:
```env
VITE_API_URL=http://localhost:5001/api
```

### Token Expired Error

**Problem**: "Invalid or expired token" on protected routes

**Solution**: Login again to get a new token. Tokens expire after 24 hours.

### CORS Error in Frontend

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
1. Verify CORS_ORIGIN in backend `.env` matches frontend URL
2. Check API_URL in `frontend/src/services/api.js`
3. Restart backend server after changing CORS_ORIGIN

### 404 on API Routes

**Problem**: "Cannot POST /api/auth/login"

**Solutions**:
1. Verify backend is running on port 5000
2. Check API routes are properly imported in `server.js`
3. Verify route files exist in `/routes` directory

### Seeding Script Errors

**Problem**: "Error: Error: relation "users" does not exist"

**Solutions**:
1. Run SQL files in correct order (starting with users_table.sql)
2. Verify database exists: `\l` in psql
3. Clear and restart: `DROP DATABASE school_results_db; CREATE DATABASE school_results_db;`
4. Ensure you have bcryptjs installed: `npm install bcryptjs`

## Project Structure Reference

```
school-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── sql/
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── ProtectedAdminRoute.jsx
│   │   │   └── ProtectedTeacherRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ManageClasses.jsx
│   │   │   │   ├── ManageSubjects.jsx
│   │   │   │   ├── ManageTeachers.jsx
│   │   │   │   ├── ManageStudents.jsx
│   │   │   │   └── ManageAssignments.jsx
│   │   │   └── teacher/
│   │   │       ├── TeacherDashboard.jsx
│   │   │       └── TeacherResultsManagement.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── classesService.js
│   │   │   ├── subjectsService.js
│   │   │   ├── teachersService.js
│   │   │   ├── studentsService.js
│   │   │   └── assignmentsService.js
│   │   ├── store/
│   │   │   └── authSlice.js
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── my-expo-app/
    ├── screens/
    │   ├── LoginScreen.tsx
    │   └── ResultsScreen.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── lib/
    │   └── api.ts
    ├── app.json
    └── package.json
```

## Features Implemented

### Admin Dashboard
- ✅ View statistics (classes, subjects, teachers, students, assignments)
- ✅ Navigate to management pages
- ✅ Manage all entities (CRUD operations)
- ✅ Logout functionality

### Teacher Dashboard
- ✅ View assigned classes and subjects
- ✅ Manage student results
- ✅ Edit and save scores
- ✅ Per-subject results management

### Authentication
- ✅ Login with username/password
- ✅ JWT token generation
- ✅ Token persistence (localStorage)
- ✅ Role-based access control
- ✅ Protected routes

### Database
- ✅ PostgreSQL schema with relations
- ✅ User roles (admin, teacher, student)
- ✅ Class and subject management
- ✅ Teacher assignments
- ✅ Student results with calculations
- ✅ Cascading deletes

## Next Steps (Future Enhancements)

- [ ] Implement student dashboard/portal
- [ ] Add email notifications
- [ ] Implement advanced filtering/search
- [ ] Add report generation
- [ ] Implement file uploads for student documents
- [ ] Add analytics and charts
- [ ] Implement two-factor authentication
- [ ] Add audit logging

## Support & Documentation

For detailed information:
- Backend API docs: `backend/README.md`
- Database schema: See SQL files in `backend/sql/`
- Frontend components: Check component files in `frontend/src/`

## License

This project is proprietary and used for educational purposes.
