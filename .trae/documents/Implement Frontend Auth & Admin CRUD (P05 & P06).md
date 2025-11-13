## Current State
- Auth flow, protected routes, and dashboard shell exist: `frontend/src/App.tsx`, `DashboardLayout.jsx`, `ProtectedAdminRoute.jsx`, `ProtectedTeacherRoute.jsx`.
- Redux store and `authSlice` are set: `frontend/src/store/store.js`, `authSlice.js`.
- Axios instance with token interceptor is configured: `frontend/src/services/api.js`.
- Tailwind v4 with `tw-animate-css` is active via `src/index.css`; shadcn configured (`components.json`) with `button` present.
- Backend endpoints for auth and CRUD are implemented under `/api/*` and align with admin/teacher roles.

## Goals
- P05: Solidify login and role-based routing to admin/teacher dashboards; ensure token persistence and guards.
- P06: Deliver admin CRUD UI for Classes, Subjects, and Students with forms, tables, validation, toasts, and API integration.

## Dependencies & Conventions
- Keep JS/TS mix consistent: `App.tsx` is TS, most pages are `.jsx`. New admin pages will follow existing `.jsx` style.
- Use existing axios client (`api.js`) and Redux slice patterns (`authSlice.js`).
- Use shadcn/ui components; add `input`, `label`, `dialog`, `table`, `toast` as needed following `components.json` paths.
- Tailwind v4 utilities and `tw-animate-css` for subtle UI motion.

## P05 — Auth & Routing
1. Verify login flow in `LoginPage.jsx` sends to `/api/auth/login` and dispatches `setLogin` (frontend/src/pages/LoginPage.jsx).
2. Confirm token/role stored (`localStorage`, redux) and guards read them in `ProtectedAdminRoute.jsx` and `ProtectedTeacherRoute.jsx`.
3. Ensure routes target implemented pages:
   - Admin: `/admin/dashboard`, `/admin/classes`, `/admin/subjects`, `/admin/students`.
   - Teacher: `/teacher/dashboard`, `/teacher/results`.
4. Ensure axios 401 handling clears auth and redirects to `/login` (`frontend/src/services/api.js`).
5. Navigation in `DashboardLayout.jsx` shows role-appropriate links.

## P06 — API Services
- Create three service modules under `frontend/src/services/`:
  - `classesService.js`: `listClasses`, `createClass`, `updateClass`, `deleteClass` → `/api/classes`.
  - `subjectsService.js`: `listSubjects`, `createSubject`, `updateSubject`, `deleteSubject` → `/api/subjects`.
  - `studentsService.js`: `listStudents`, `getStudent`, `createStudent`, `updateStudent`, `deleteStudent` → `/api/students`.
- Use shared axios instance; return data and surface errors in a consistent `{ message | errors }` format.

## P06 — Admin Pages
- Manage Classes (`frontend/src/pages/admin/ManageClasses.jsx`)
  - Keep implemented table and form; align payload `{ name, grade_level, academic_year }` with backend (backend/routes/classesRoutes.js:22–26).
  - Add success/error toasts; loading states; inline validation.
- Manage Subjects (`frontend/src/pages/admin/ManageSubjects.jsx`)
  - Keep implemented CRUD; align payload `{ name, code, description? }` and unique code feedback.
  - Add toasts and validation.
- Manage Students (`frontend/src/pages/admin/ManageStudents.jsx`)
  - Implement full CRUD UI:
    - Table listing with search/filter by class.
    - Create/Edit form with fields per backend payload: `{ username, password, email, first_name, last_name, student_id, class_id, date_of_birth?, parent_name, parent_phone?, parent_email? }` (backend/routes/studentsRoutes.js:16–28).
    - Delete with confirm dialog.
  - Integrate service functions; show loading, error messages from validator responses; success toasts.

## UI/UX Details
- Components: `Button` (existing), add `Input`, `Label`, `Dialog`, `Table`, and toast primitives via shadcn.
- Validation: basic required checks client-side; surface backend `express-validator` errors nicely.
- Motion: use `tw-animate-css` for dialog open/close and toast entrance.
- Accessibility: keyboard-focus styles; aria labels on dialog buttons.

## Verification
- Manual flows:
  - Login as admin → navigate to Classes/Subjects/Students; perform full CRUD; verify backend changes and UI refresh.
  - Login as teacher → verify teacher routes unaffected.
- Error handling:
  - Trigger validator errors (e.g., missing required fields) and confirm graceful messages.
  - Trigger 401 by expiring/removing token; confirm redirect to login.

## Deliverables
- Service modules: `classesService.js`, `subjectsService.js`, `studentsService.js`.
- Completed `ManageStudents.jsx` with full CRUD; enhancements to Classes/Subjects pages (toasts/validation/loading).
- Route links under admin dashboard (already present) verified.

## Acceptance Criteria Mapping
- Full CRUD works in UI with backend state reflection (tables update after operations).
- Authenticated users routed to role-appropriate dashboards; unauthenticated redirected to login.

## References
- Auth controller response shape: `backend/controllers/authController.js:75–88`.
- Classes endpoints: `backend/routes/classesRoutes.js:22–26`.
- Subjects endpoints: `backend/routes/subjectsRoutes.js:22–26`.
- Students endpoints & payload: `backend/routes/studentsRoutes.js:16–28, 40–45`.
- Axios client/interceptors: `frontend/src/services/api.js`.
- Store & slice: `frontend/src/store/store.js`, `frontend/src/store/authSlice.js`.
- Routing: `frontend/src/App.tsx`.