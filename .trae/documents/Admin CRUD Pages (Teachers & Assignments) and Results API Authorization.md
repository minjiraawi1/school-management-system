# Scope
- Implement two admin UI pages and supporting services (Teachers, Assignments) aligned with existing CRUD patterns.
- Align Results API to strict teacher authorization and input validation; keep current upsert flow or add explicit update route per task spec.

## Frontend — Admin Pages (Teachers & Assignments)
### Manage Teachers
- Create `frontend/src/services/teachersService.js` with `listTeachers`, `createTeacher`, `updateTeacher`, `deleteTeacher` using routes in `backend/routes/teachersRoutes.js:36-41`.
- Implement `frontend/src/pages/admin/ManageTeachers.jsx` mirroring `ManageStudents.jsx` and `ManageClasses.jsx`:
  - List with pagination-ready structure from `getAllTeachers` (`backend/controllers/teachersController.js:5-37`).
  - Create form includes user fields and teacher fields: username, password, email, first/last name, employee_id, specialization, qualification, experience_years, hire_date. Backend create links user and teacher in one transaction (`backend/controllers/teachersController.js:62-115`).
  - Update form for teacher-only fields (`backend/controllers/teachersController.js:117-149`).
  - Delete removes teacher and linked user (`backend/controllers/teachersController.js:151-186`).
  - Surface backend uniqueness messages: employee_id and username/email collisions (`backend/controllers/teachersController.js:101-111`).

### Manage Assignments
- Create `frontend/src/services/assignmentsService.js` with `listAssignments`, `createAssignment`, `deleteAssignment` mapping `backend/routes/assignmentsRoutes.js:24-28`.
- Implement `frontend/src/pages/admin/ManageAssignments.jsx`:
  - Top filters: Teacher, Subject, Class, Academic Year; client-side filter over `getAllAssignments` data (`backend/controllers/assignmentsController.js:4-42`).
  - Form with dropdowns for Teacher, Subject, Class and `academic_year`; submit to `POST /api/assignments` (`backend/controllers/assignmentsController.js:97-126`).
  - List shows teacher name, subject, class, year; delete via `DELETE /api/assignments/:id` (`backend/controllers/assignmentsController.js:128-144`).
  - Surface uniqueness violation message “This assignment already exists” (`backend/controllers/assignmentsController.js:117-124`) enforced by DB unique `(teacher_id, subject_id, class_id, academic_year)` (`backend/sql/teachers_students_assignments_tables.sql:39`).
- Data sources for dropdowns: `GET /api/teachers` (`backend/routes/teachersRoutes.js:36`), `GET /api/subjects` (`backend/routes/subjectsRoutes.js`), `GET /api/classes` (`backend/routes/classesRoutes.js`).

## Backend — Results API & Teacher Authorization
- Current routes are implemented in `backend/routes/resultsRoutes.js:27-30` with upsert handler `createOrUpdateResult` (`backend/controllers/resultsController.js:5`) and queries for student/class+subject (`backend/controllers/resultsController.js:64,84`).
- Authorization via `checkTeacher` validates JWT role, maps `req.teacherId`, enforces assignment for POST/PUT using `teacher_assignments` and student’s class (`backend/middleware/checkTeacher.js:38-66`); GET-by-class+subject guarded similarly.
- Table schema and uniqueness/indexes exist: `backend/sql/results_table.sql:2-27` with `UNIQUE(student_id, subject_id, academic_year)`. Scores validated in route validators (`backend/routes/resultsRoutes.js:13-24`).
- Optional alignment to task spec: add `PUT /api/results/:resultId` for explicit updates; ensure `checkTeacher` guards ownership on PUT by `resultId` analogous to GET check (`backend/middleware/checkTeacher.js:68-81`). Keep existing upsert for batch saving from `TeacherResultsManagement.jsx` if desired.

## UX & Error Handling
- Use existing banner pattern for success/error (as in `ManageClasses.jsx:106-115` and `ManageStudents.jsx:189-198`). Map backend error payloads directly to UI messages.
- Validate required form fields on the client; for assignments, prevent empty dropdowns and trim `academic_year`.

## Routing & Access
- Pages already wired in router (`frontend/src/App.tsx:28-33`). Ensure components render and respect admin protection via `ProtectedAdminRoute`.

## Verification
- Frontend: manual flows — create teacher, edit, delete; create assignment, list, filter, delete; confirm uniqueness feedback.
- Backend: exercise results creation from teacher UI `TeacherResultsManagement.jsx:84-106` to verify `403` for unauthorized classes/subjects; confirm `POST /api/results` and `GET /api/results/class/...` work.

## Deliverables
- Two admin React components and small service modules.
- No backend schema changes required; optional route addition for `PUT /api/results/:resultId` if strict adherence to spec is preferred.

## Acceptance Mapping
- Reliable assignment create/delete with constraint surfaced.
- Unauthorized results submissions receive `403`; authorized succeed by middleware and unique checks.