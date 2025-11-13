Title: Backend — Admin CRUD Part 1 (Classes, Subjects)

Objective
- Provide admin-only CRUD endpoints for `classes` and `subjects`.

Prerequisites
- Authentication API operational.
- JWT middleware available.

Subtasks
- Implement `checkAuth` middleware: verify JWT, attach user to request.
- Implement `checkAdmin` middleware: ensure `role === 'admin'`.
- Define schemas for `classes` and `subjects` (ids, names, uniqueness, timestamps).
- Implement controllers and routes:
  - Classes: `GET /api/classes`, `GET /api/classes/:id`, `POST`, `PUT`, `DELETE`.
  - Subjects: `GET /api/subjects`, `GET /api/subjects/:id`, `POST`, `PUT`, `DELETE`.
- Protect all endpoints with `checkAdmin`.
- Add pagination-ready list responses and basic validation.

Deliverables
- Middleware files: `checkAuth`, `checkAdmin`.
- Controllers and routes for classes and subjects.
- SQL migrations or statements for tables.

Acceptance Criteria
- All endpoints function and are admin-restricted.
- Error responses for invalid ids and duplicate names.
