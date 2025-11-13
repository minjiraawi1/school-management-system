## Folder Structure
- Create `tasks/` at project root
- Add one task file per prompt (02–11):
  - `tasks/P02-authentication-api.md`
  - `tasks/P03-admin-crud-part1.md`
  - `tasks/P04-admin-crud-part2.md`
  - `tasks/P05-frontend-auth-routing.md`
  - `tasks/P06-admin-crud-pages-classes-subjects-students.md`
  - `tasks/P07-admin-crud-pages-teachers-assignments.md`
  - `tasks/P08-results-api-teacher-authorization.md`
  - `tasks/P09-teacher-dashboard-ui.md`
  - `tasks/P10-student-results-endpoint.md`
  - `tasks/P11-react-native-student-portal.md`

## P02 — Authentication API (`tasks/P02-authentication-api.md`)
- Define `users` table SQL (columns, constraints, indexes)
- Implement `authController` with `registerUser` and `loginUser`
- Create `authRoutes` with `POST /auth/register` and `POST /auth/login`
- Add password hashing with `bcrypt.js`
- Generate JWT with `jsonwebtoken` including `userId` and `role`
- Wire up route mounting in `backend` Express app
- Acceptance: Successful register/login flows, JWT returned, errors handled

## P03 — Admin CRUD Part 1 (`tasks/P03-admin-crud-part1.md`)
- Create `checkAuth` middleware to verify JWT
- Create `checkAdmin` middleware to enforce `role === 'admin'`
- Implement Classes CRUD routes and controllers
- Implement Subjects CRUD routes and controllers
- Ensure DB schema for `classes` and `subjects` exists
- Protect all routes with `checkAdmin`
- Acceptance: All endpoints work, protected, pagination-ready lists

## P04 — Admin CRUD Part 2 (`tasks/P04-admin-crud-part2.md`)
- Implement Teachers CRUD (create linked `users` and `teachers` rows)
- Implement Students CRUD (create linked `users` and `students` rows)
- Implement Teacher Assignments CRUD for junction table
- Validate relational integrity and unique constraints
- Protect with `checkAdmin`
- Acceptance: Linked user records, assignments enforce uniqueness per teacher/subject/class

## P05 — Frontend Auth & Routing (`tasks/P05-frontend-auth-routing.md`)
- Install and verify dependencies in `frontend`
- Configure Redux store and `authSlice` (`setLogin`, `setLogout`)
- Set up `react-router-dom` routes in `App` with layout
- Create `LoginPage` and connect to backend `/auth/login`
- Create `DashboardLayout` with basic scaffold
- Implement `ProtectedAdminRoute` and `ProtectedTeacherRoute`
- Configure Axios instance with token interceptor
- Acceptance: Redirects based on role, token persisted, guarded routes render

## P06 — Admin Pages: Classes, Subjects, Students (`tasks/P06-admin-crud-pages-classes-subjects-students.md`)
- Build Manage Classes page (form + list + edit/delete)
- Build Manage Subjects page (form + list + edit/delete)
- Build Manage Students page (form + list + edit/delete)
- Integrate API calls, loading states, errors, and toasts
- Use `shadcn/ui` and Tailwind v4-compatible animations
- Acceptance: Full CRUD works with optimistic UI and validations

## P07 — Admin Pages: Teachers & Assignments (`tasks/P07-admin-crud-pages-teachers-assignments.md`)
- Build Manage Teachers page with linked user creation
- Build Manage Assignments page (teacher/subject/class selectors)
- Implement assignment create and delete actions
- Display current assignments list with filters
- Acceptance: Assignment creation enforces unique teacher-subject-class tuples

## P08 — Results API & Teacher Authorization (`tasks/P08-results-api-teacher-authorization.md`)
- Create `resultsController` and `resultsRoutes`
- Implement `POST /api/results` and `PUT /api/results/:resultId`
- Create `checkTeacher` middleware (JWT, role, assignment authorization)
- Query `teacher_assignments` and student’s class for authorization
- Define `results` table schema and validations
- Acceptance: Unauthorized submissions rejected, authorized writes succeed

## P09 — Teacher Dashboard UI (`tasks/P09-teacher-dashboard-ui.md`)
- Fetch teacher’s assignments (`GET /api/assignments/teacher/me`)
- Add selectors for Assigned Class and Subject
- Fetch students in selected class (`GET /api/students/class/:classId`)
- Render table with subject-specific score inputs
- Submit scores via Results API (create/update)
- Handle success, error, and in-flight states
- Acceptance: End-to-end result submission for assigned class/subject

## P10 — Student Results Endpoint (`tasks/P10-student-results-endpoint.md`)
- Implement `checkStudent` middleware (role == student)
- Create `GET /api/results/student/me` endpoint
- Join subjects and compute per-subject totals (term 1 & 2)
- Compute grand totals and annual average
- Return normalized JSON with all aggregates
- Acceptance: Correct calculations match plan, secured access

## P11 — React Native Student Portal (`tasks/P11-react-native-student-portal.md`)
- Verify Expo project dependencies and configuration in `my-expo-app`
- Implement `LoginScreen` with `/auth/login` and secure token storage
- Implement protected navigation stack after login
- Implement `ResultsScreen` calling `/api/results/student/me`
- Render totals and per-subject breakdown in `ScrollView`
- Acceptance: Mobile login persists token, results render as specified

## Notes
- Reference existing setup from backend/frontend/mobile directories
- Align Tailwind config with v4 and `tw-animate-css` where applicable
- Include error handling, validation, and secure storage across tasks