Title: Backend — Authentication API

Objective
- Implement secure user registration and login with JWT.

Prerequisites
- Backend Express app from Prompt 1 is running.
- Environment variables set for database and `JWT_SECRET`.

Subtasks
- Define `users` table schema: id, username, password_hash, role, created_at, unique constraints.
- Implement `registerUser` (admins only): validate role, hash password, insert user.
- Implement `loginUser`: verify credentials, issue JWT with `userId` and `role`.
- Create `authRoutes`: `POST /auth/register`, `POST /auth/login`.
- Add error handling for duplicates, invalid credentials, missing fields.
- Mount routes in server and verify CORS.

Deliverables
- Users table SQL ready to run.
- Controller file with `registerUser` and `loginUser`.
- Routes file wiring endpoints to controller.

Acceptance Criteria
- Register creates user with hashed password and returns success.
- Login returns JWT with payload `{ userId, role }`.
- Proper 400/401 responses for invalid input and auth failures.
