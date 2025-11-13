## Overview
- Build a complete teacher-facing results management page and wire it into routing.
- Align frontend data model with backend `results` schema (four monthly scores, midterm, final, and generated term totals).
- Adjust backend results query to return the full class roster (left join) so teachers can grade all students in an assigned class/subject for a given academic year.

## Current Findings
- Results routes exist and are mounted: `backend/server.js:28–34`.
- Results endpoints: `POST /api/results` and `PUT /api/results` for upsert; `GET /api/results/class/:classId/subject/:subjectId/:academicYear` for teachers (`backend/routes/resultsRoutes.js:27–31`).
- Results schema supports two generated totals: `term_1_total` and `term_2_total` (`backend/sql/results_table.sql:13–22`).
- Teacher dashboard file exists and lists assignments: `frontend/src/pages/teacher/TeacherDashboard.jsx`.
- Router currently renders placeholders for teacher pages: `frontend/src/App.tsx:33–38`.
- Students admin-only route exists: `GET /api/students/class/:classId` requires admin (`backend/routes/studentsRoutes.js:41`).

## Frontend Implementation
- Update router to render real teacher pages:
  - Import `TeacherDashboard` and `TeacherResultsManagement` and map routes:
    - `Route path="/teacher/dashboard"` → `TeacherDashboard`.
    - `Route path="/teacher/results"` → `TeacherResultsManagement`.
- Update dashboard navigation:
  - Replace `href` in `TeacherDashboard` with `Link` to `/teacher/results?class=<id>&subject=<id>&year=<academic_year>` to match `BrowserRouter` instead of hash routing.
- Create `TeacherResultsManagement.jsx`:
  - Read `class`, `subject`, `year` from `location.search`.
  - Fetch roster+results via `GET /api/results/class/:classId/subject/:subjectId/:academicYear`.
  - Render a table with inputs for: `first_monthly_score`, `second_monthly_score`, `midterm_exam_score`, `third_monthly_score`, `fourth_monthly_score`, `final_exam_score`.
  - Display computed `term_1_total` and `term_2_total` inline for UX; use server values when present.
  - Validate 0–100 numeric ranges, keyboard-friendly inputs, and clear error UI.
  - Save per student by calling `POST /api/results` (upsert) with body fields aligned to backend (`backend/controllers/resultsController.js:14`).
  - Handle loading/saving states and success feedback.

## Backend Adjustment (Read-Only Plan)
- Modify `getResultsByClassAndSubject` to return all students in the class via a left join, preserving teacher filtering:
  - New SQL shape (conceptual):
    - `FROM students st JOIN users u ON st.user_id = u.id`
    - `LEFT JOIN results r ON r.student_id = st.id AND r.subject_id = $2 AND r.academic_year = $3 AND r.teacher_id = $4`
    - `WHERE st.class_id = $1`
  - Keeps endpoint path: `GET /api/results/class/:classId/subject/:subjectId/:academicYear` (`backend/routes/resultsRoutes.js:30`).
  - Continues to require `checkTeacher` and uses `req.teacherId` for filtering.
- No new endpoints needed; avoids using admin-only student routes.

## Data Model Alignment
- Use backend field names exactly:
  - `first_monthly_score`, `second_monthly_score`, `midterm_exam_score`, `third_monthly_score`, `fourth_monthly_score`, `final_exam_score`, `academic_year` (`backend/controllers/resultsController.js:14`).
- Remove any notion of `term` query param from UI; show server-provided `term_1_total` and `term_2_total` where available (`backend/sql/results_table.sql:13–22`).

## Accessibility & UX
- Inputs with `min=0`, `max=100`, `step=0.1`, clear placeholders.
- Error messages in ARIA-friendly containers; keyboard navigation preserved.
- Loading skeletons and unobtrusive success banners.

## Testing & Verification
- Backend: add tests for left-join query to ensure full roster and correct teacher scoping.
- Frontend: component tests for input validation, save workflow, and rendering of totals.
- Manual QA: login as teacher → view assignments → open results page → edit/save → refresh to confirm persistence.

## Deliverables
- Updated `frontend/src/App.tsx` to wire teacher pages.
- Updated `frontend/src/pages/teacher/TeacherDashboard.jsx` navigation.
- New `frontend/src/pages/teacher/TeacherResultsManagement.jsx` with full UI and logic.
- Adjusted `backend/controllers/resultsController.js:getResultsByClassAndSubject` left-join logic.

## Acceptance Criteria
- Teacher sees all students in an assigned class/subject for the selected year.
- Scores can be entered/edited with validation; saving persists per student.
- Term totals are visible and consistent with backend-generated columns.
- Unauthorized access blocked via existing middleware; admin-only student routes are not required by teacher UI.