## Summary
The backend already implements most of P03 and P04: admin-protected CRUD for classes, subjects, teachers, students, and teacher_assignments, using Express + pg and JWT auth middleware. To fully meet the tasks and acceptance criteria, we will add pagination-ready list responses, strengthen duplicate/uniqueness handling, and add param validation on IDs.

## Current State (verified)
- Server & routes: `backend/server.js:42-49` mounts `/api/auth`, `/api/classes`, `/api/subjects`, `/api/teachers`, `/api/students`, `/api/assignments`, `/api/results`.
- Auth middleware:
  - `middleware/checkAuth.js:5-28` verifies JWT and loads `req.user`.
  - `middleware/checkAdmin.js:4-24` enforces `role === 'admin'`.
- P03 endpoints:
  - Classes routes: `routes/classesRoutes.js:21-26`; controller: `controllers/classesController.js:4-13,32-55,57-85,87-103`.
  - Subjects routes: `routes/subjectsRoutes.js:21-26`; controller: `controllers/subjectsController.js:4-13,15-30,32-59,61-93,95-111`.
  - Schemas: `sql/classes_subjects_tables.sql:1-19` (subjects unique `code`; timestamps present).
- P04 endpoints:
  - Teachers routes: `routes/teachersRoutes.js:36-41`; controller (linked user creation): `controllers/teachersController.js:45-98`.
  - Students routes: `routes/studentsRoutes.js:39-45`; controller (linked user creation): `controllers/studentsController.js:68-123`.
  - Assignments routes: `routes/assignmentsRoutes.js:23-28`; controller with uniqueness handling: `controllers/assignmentsController.js:80-109`.
  - Schemas: `sql/teachers_students_assignments_tables.sql:29-40` (unique `(teacher_id, subject_id, class_id, academic_year)`; cascades on FKs).

## Gaps to Address
- Pagination-ready responses: list endpoints currently return raw arrays; no `page/limit/total` metadata.
- Duplicate names: subjects enforce unique `code`, not `name`; classes have no uniqueness (task mentions “names, uniqueness”).
- Invalid IDs: GET `/:id` endpoints lack param validation; non-integer IDs can produce DB errors.

## P03 Plan (Classes, Subjects)
1. Add pagination to list endpoints (`GET /api/classes`, `GET /api/subjects`):
   - Accept `page` (default 1), `limit` (default 20); compute `offset`.
   - Return `{ data, pagination: { total, page, limit, pages } }`.
   - Implement counting via `SELECT COUNT(*)` and ordered `SELECT ... LIMIT ... OFFSET ...`.
2. Enforce uniqueness and duplicate error messaging:
   - Subjects: add unique index on `name` or enforce app-level check; return `400 'Subject name already exists'` on conflict.
   - Classes: add unique index on `(name, academic_year)` (or `(name, grade_level, academic_year)`); return `400 'Class already exists for academic year'`.
   - Update controllers to catch `error.code === '23505'` and map to clear messages.
   - Update `sql/classes_subjects_tables.sql` accordingly.
3. Add param validation for IDs:
   - Apply `param('id').isInt()` to `GET /:id`, `PUT /:id`, `DELETE /:id` in `classesRoutes.js` and `subjectsRoutes.js`.
   - Respond `400` with validation errors when invalid.

## P04 Plan (Teachers, Students, Assignments)
1. Pagination on list endpoints:
   - `GET /api/teachers`, `GET /api/students`, `GET /api/assignments` support `page`/`limit` and return `{ data, pagination }`.
2. Validation and integrity:
   - Add `param('id').isInt()` on `GET /:id`, `PUT /:id`, `DELETE /:id` for teachers/students.
   - Keep existing FK cascades (`ON DELETE CASCADE`) and uniqueness constraints for assignments.
3. Error messaging polish:
   - Standardize `400` messages for unique/foreign key violations (already partially implemented) and ensure consistency across controllers.

## API Response Shape (pagination)
- Lists return:
```
{
  data: [ ...items ],
  pagination: { total, page, limit, pages }
}
```
- Query params: `?page=1&limit=20` (both optional).

## Verification
- Manual checks via running dev server:
  - Auth: login to get JWT, then hit admin routes with `Authorization: Bearer <token>`.
  - Create duplicates to verify `23505` handling for classes/subjects.
  - Exercise list endpoints with different `page/limit` to confirm metadata.
- Optional unit tests for controllers to validate pagination math, uniqueness errors, and param validation.

## Deliverables
- Route updates: add `param` validators and pagination query handling in routes.
- Controller updates: implement `LIMIT/OFFSET`, `COUNT(*)`, map `23505/23503` to clear errors.
- SQL updates: add unique indexes for classes and subjects names as described.

Confirm and I will implement changes across routes/controllers/sql, following existing conventions (Express, `express-validator`, raw `pg`) and provide verified endpoints.