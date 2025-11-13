Title: Frontend — Admin/Teacher Dashboard Auth & Routing

Objective
- Establish SPA scaffolding with role-based protected routes and auth state.

Prerequisites
- Frontend Vite project exists with `shadcn/ui` installed.
- Backend auth endpoints reachable.

Subtasks
- Verify and install dependencies: `react-router-dom`, `redux`, `@reduxjs/toolkit`, `react-redux`, `axios`.
- Configure Redux store and `authSlice` with state `{ userId, role, token }` and reducers `setLogin`, `setLogout`.
- Create `LoginPage` with form and API call to `/auth/login`; store token and role.
- Create `DashboardLayout` as post-login shell (nav, content outlet).
- Implement `ProtectedAdminRoute` and `ProtectedTeacherRoute` components gating by role and token.
- Configure `App` routes: login, admin dashboard, teacher dashboard.
- Create Axios instance with interceptor to attach token.

Deliverables
- Store setup and slice.
- Route components and layout.
- Login page integrated with backend.

Acceptance Criteria
- Authenticated users are routed to role-appropriate dashboards.
- Unauthenticated access redirects to login.
