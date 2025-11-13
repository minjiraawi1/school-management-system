Title: Backend — Admin CRUD Part 2 (Teachers, Students, Assignments)

Objective
- Extend admin-only CRUD to teachers, students, and `teacher_assignments` junction.

Prerequisites
- Part 1 CRUD complete.
- Users table and auth API available.

Subtasks
- Define `teachers`, `students`, and `teacher_assignments` schemas with foreign keys to `users`, `classes`, `subjects`.
- Teachers CRUD: creating a teacher also creates a linked `users` row; enforce role `teacher`.
- Students CRUD: creating a student also creates a linked `users` row; enforce role `student`.
- Teacher Assignments CRUD: `GET`, `POST`, `DELETE` with uniqueness `(teacher_id, subject_id, class_id)`.
- Protect all routes with `checkAdmin`.
- Validate relational integrity and cascading deletes or constraints as needed.

Deliverables
- Controllers and routes for teachers, students, assignments.
- SQL for schemas and indexes.

Acceptance Criteria
- Linked user records created consistently.
- Assignment uniqueness enforced; meaningful error on conflicts.
