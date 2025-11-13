Title: Frontend — Teacher Dashboard UI

Objective
- Allow teachers to select assignments, view class students, and submit scores.

Prerequisites
- Results API with authorization in place.
- Frontend routing and auth available.

Subtasks
- On load, fetch teacher’s assignments: `GET /api/assignments/teacher/me`.
- Selectors for Assigned Class and Subject; derived subject options by class.
- Fetch students in selected class: `GET /api/students/class/:classId`.
- Render table of students with inputs only for selected subject’s scores.
- Submit scores via `POST /api/results` or `PUT` for updates.
- Provide success/error handling, loading indicators, and input validation.

Deliverables
- Teacher dashboard component and API integrations.

Acceptance Criteria
- End-to-end result entry functions for authorized assignments.
