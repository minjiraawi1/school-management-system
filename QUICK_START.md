# Quick Start Reference

## All Commands in One Place

### Backend Setup (from project root)
```bash
# 1. Create database (in psql)
CREATE DATABASE school_results_db;

# 2. Setup backend
cd backend
pnpm install
cp .env.example .env
# Edit .env with your DB password

# 3. Initialize database schema
psql -U postgres -d school_results_db -f sql/users_table.sql
psql -U postgres -d school_results_db -f sql/classes_subjects_tables.sql
psql -U postgres -d school_results_db -f sql/teachers_students_assignments_tables.sql
psql -U postgres -d school_results_db -f sql/results_table.sql

# 4. Seed test data
node seed.js

# 5. Start backend
pnpm dev
# Server: http://localhost:5000
```

### Frontend Setup (from project root)
```bash
# 1. Setup frontend
cd frontend
pnpm install

# 2. Start frontend
pnpm dev
# App: http://localhost:5173
```

### Verify Everything Works
```bash
# In another terminal, test API
curl http://localhost:5000/health

# Should return: {"status":"ok","db":"connected"}
```

## Test Credentials

### Admin
- **URL**: http://localhost:5173
- **Username**: admin
- **Password**: admin123
- **Can**: Manage everything

### Teacher (Example)
- **Username**: teacher1
- **Password**: teacher123
- **Can**: Manage results for assigned classes/subjects

### Student (Example)
- **Username**: student1
- **Password**: student123
- **Can**: View personal results

## Quick Test Scenarios

### Scenario 1: Admin Creates New Class
1. Login with admin credentials
2. Go to Admin Dashboard → Classes
3. Click "Add New Class"
4. Fill: Name=Class 9-A, Grade=9, Year=2024-2025
5. Click Create
6. Verify appears in list

### Scenario 2: Teacher Submits Results
1. Login with teacher1 credentials
2. Go to Teacher Dashboard
3. Click "Manage Results" on Math assignment
4. Select Class 10-A and Math subject
5. Edit scores for students
6. Click Save
7. Verify success message

### Scenario 3: Student Views Results
1. Login with student1 credentials
2. Should show results dashboard
3. Verify personal scores display correctly
4. Verify calculations (term totals, annual average)

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Cannot connect to database" | Check DB password in .env, verify PostgreSQL running |
| "Port 5000 in use" | Kill process: `lsof -ti:5000 \| xargs kill -9` or change PORT in .env |
| "CORS error" | Verify CORS_ORIGIN in backend .env matches frontend URL |
| "Token error" | Login again, tokens expire after 24 hours |
| "Route not found (404)" | Restart backend server |
| "Module not found" | Run `pnpm install` again |

## File Locations to Remember

- Backend config: `backend/.env`
- Database schema: `backend/sql/`
- Seeding script: `backend/seed.js`
- Frontend API config: `frontend/src/services/api.js`
- Admin dashboard: `frontend/src/pages/admin/AdminDashboard.jsx`
- Teacher dashboard: `frontend/src/pages/teacher/TeacherDashboard.jsx`

## Useful Commands

```bash
# Backend
pnpm dev          # Start development server
npm run dev       # Alternative
pnpm build        # Build for production

# Frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Database
psql -l           # List databases
psql -d school_results_db  # Connect to database
\dt               # Show tables in psql
\du               # Show users in psql
```

## API Endpoints Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/login | No | Login |
| GET | /api/classes | Admin | List classes |
| POST | /api/classes | Admin | Create class |
| GET | /api/teachers | Admin | List teachers |
| POST | /api/teachers | Admin | Create teacher |
| GET | /api/students | Admin | List students |
| POST | /api/students | Admin | Create student |
| GET | /api/assignments/teacher/me | Teacher | Get my assignments |
| POST | /api/results | Teacher | Submit results |
| GET | /api/results/student/me/:year | Student | Get my results |

## File Checklist

After setup, verify these files exist:

**Backend**
- [ ] `backend/.env` (created from .env.example)
- [ ] `backend/seed.js` (test data seeder)
- [ ] `backend/server.js`
- [ ] `backend/config/db.js`
- [ ] `backend/sql/` (4 SQL files)

**Frontend**
- [ ] `frontend/src/pages/admin/AdminDashboard.jsx`
- [ ] `frontend/src/pages/admin/ManageTeachers.jsx`
- [ ] `frontend/src/pages/admin/ManageAssignments.jsx`
- [ ] `frontend/src/services/teachersService.js`
- [ ] `frontend/src/services/assignmentsService.js`
- [ ] `frontend/src/pages/LoginPage.jsx` (updated)

**Mobile**
- [ ] `my-expo-app/lib/api.ts` (fixed path param bug)
- [ ] `my-expo-app/screens/LoginScreen.tsx`
- [ ] `my-expo-app/screens/ResultsScreen.tsx`

## Need Help?

1. Check error messages in browser console (F12)
2. Check backend terminal for API errors
3. Check PostgreSQL is running: `pg_isready`
4. Verify .env file has correct credentials
5. See SETUP_GUIDE.md for detailed troubleshooting
