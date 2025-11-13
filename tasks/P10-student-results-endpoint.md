Title: Backend — Student Results Endpoint (with Calculations)

Objective
- Provide a single secured endpoint returning computed results for a student.

Prerequisites
- Results data populated and subjects table available.
- Student-role auth middleware ready.

Subtasks
- Implement `checkStudent` middleware enforcing role `student`.
- Implement `GET /api/results/student/me`: derive `student_id` from JWT.
- Fetch all results for the student; join with `subjects` for names.
- Perform server-side calculations for term totals and annual average.
- Return normalized JSON: per-subject raw scores, `term_1_total`, `term_2_total`, grand totals, final result.

Deliverables
- Middleware, controller logic, and route.

Acceptance Criteria
- Output matches plan’s calculation rules; access restricted to student role.
