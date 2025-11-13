Title: Backend — Results API & Teacher Authorization

Objective
- Implement secure results submission limited to assigned teachers.

Prerequisites
- Teacher assignments and student/class relations available.
- Auth middleware and JWT parsing ready.

Subtasks
- Define `results` table schema covering required score fields per subject per student.
- Implement `resultsController` with `POST /api/results` (create) and `PUT /api/results/:resultId` (update).
- Implement `checkTeacher` middleware: verify JWT, role `teacher`, and authorization via `teacher_assignments` against selected subject and the student's class.
- Apply `checkTeacher` to results routes.
- Validate input payloads and prevent unauthorized writes.

Deliverables
- Controller and routes for results.
- Middleware for teacher authorization.
- SQL for `results` table and needed indexes.

Acceptance Criteria
- Unauthorized teachers receive `403`; authorized submissions succeed.
