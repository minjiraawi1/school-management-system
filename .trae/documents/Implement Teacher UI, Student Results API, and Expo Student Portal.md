## Overview
- Deliver P09 (Teacher Dashboard UI), P10 (Student Results Endpoint), and P11 (React Native Student Portal) aligned with current codebase.
- Leverage existing backend controllers and routes; add minimal, secure extensions for student access and normalized results.
- Reuse frontend teacher pages already present; add minor UX polish where needed.

## Backend — Student Results Endpoint (P10)
1. Middleware: add `checkStudent` enforcing JWT and role `student`.
   - Derive `students.id` from `users.id` and attach `req.studentId`.
   - Pattern mirrors `backend/middleware/checkTeacher.js` (backend/middleware/checkTeacher.js:5–90).
2. Route: add `GET /api/results/student/me` with academic year param.
   - Option A: `GET /api/results/student/me/:academicYear` (path param).
   - Option B: `GET /api/results/student/me?academicYear=YYYY` (query param).
   - Register in `backend/routes/resultsRoutes.js` beside existing routes (backend/routes/resultsRoutes.js:26–31).
3. Controller: implement `getMyResultsNormalized(req, res)`.
   - Query all `results` for `req.studentId` and year; join `subjects` for names (similar to `getResultsByStudent` in backend/controllers/resultsController.js:64–81).
   - Compute per-subject `term_1_total`, `term_2_total` (already generated columns, backend/sql/results_table.sql:13–22), `annual_total = term_1_total + term_2_total`.
   - Aggregate `term_1_grand_total`, `term_2_grand_total`, `annual_grand_total`, `annual_average = annual_grand_total / subjectCount`.
   - Return normalized JSON:
     - `{ subjects: [{ subject_id, subject_code, subject_name, scores: { first_monthly_score, ... final_exam_score }, term_1_total, term_2_total, annual_total }], term_1_grand_total, term_2_grand_total, annual_grand_total, annual_average }`.
4. Security:
   - Use `checkStudent` for the new route; keep `GET /api/results/student/:studentId/:academicYear` admin-only (backend/routes/resultsRoutes.js:29).
   - Validate `academicYear` presence; handle empty results with safe defaults.

## Frontend — Teacher Dashboard UI (P09)
1. Validate existing pages and flows:
   - Dashboard fetches assignments via `GET /assignments/teacher/me` (frontend/src/pages/teacher/TeacherDashboard.jsx:16–21, 45–61).
   - Results page loads class+subject+year data via `GET /results/class/:classId/subject/:subjectId/:year` (frontend/src/pages/teacher/TeacherResultsManagement.jsx:24–41) and posts scores to `/results` (frontend/src/pages/teacher/TeacherResultsManagement.jsx:103–106).
2. UX polish and acceptance alignment:
   - Ensure loading, error, success states are consistent (already present).
   - Validate 0–100 inputs (frontend/src/pages/teacher/TeacherResultsManagement.jsx:62–73) and show computed term totals inline (frontend/src/pages/teacher/TeacherResultsManagement.jsx:116–129, 203–205).
   - Optional: add a year selector when multiple academic years exist; default from assignment link.
   - Optional: add class/subject selectors derived from assignments on dashboard, keeping current card navigation.
3. Security:
   - Guard with `ProtectedTeacherRoute` (frontend/src/components/ProtectedTeacherRoute.jsx:4–16).

## Mobile — React Native (Expo) Student Portal (P11)
1. Dependencies:
   - Add: `axios`, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `expo-secure-store`.
   - Confirm Expo SDK 54 compatibility (my-expo-app/package.json:14–22).
2. API client:
   - Create `my-expo-app/lib/api.ts` using `axios.create({ baseURL: <env or http://localhost:5000/api> })`.
   - Interceptors: attach JWT from `SecureStore` and handle 401 by clearing token and redirecting to login.
3. Auth flow:
   - `LoginScreen`: form posts to `/auth/login`; on success, save token in `SecureStore` and store user snapshot in memory; navigate to app stack.
   - `AuthContext`: simple context to expose `token`, `login`, `logout`.
   - Navigation: root `Stack` with `Login` and `App` (protected). Inside `App`, a `ResultsScreen`.
4. Results screen:
   - Call `GET /api/results/student/me?academicYear=YYYY`.
   - Render totals first (`term_1_grand_total`, `term_2_grand_total`, `annual_grand_total`, `annual_average`).
   - Render per-subject list in `ScrollView` with subject name/code and scores table.
   - Loading and error states; handle token expiration by redirecting to `Login`.
5. Config:
   - `.env` or config file for API base URL; allow overriding for emulator/device.

## Verification
- Backend: unit-like controller checks and manual API tests with a student JWT; verify that non-student roles receive 403.
- Frontend: navigate teacher dashboard, open a class/subject, edit scores, and save; confirm server updates and computed term totals.
- Mobile: login with student account, fetch and display results for selected academic year; verify error handling on expired token.

## Notes & Risks
- `GET /api/students/class/:classId` is admin-only (backend/routes/studentsRoutes.js:40–45); teacher UI correctly relies on `/api/results/class/...` which is teacher-protected.
- Ensure database has subject assignments and results for meaningful mobile output.
- If multiple academic years per student exist, add a year picker to `ResultsScreen` and default to current.
