## Scope
- Confirm and validate the initial Express + PostgreSQL setup, aligned with Prompt 1.

## Verification Checklist
- Dependencies: `express`, `pg`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv` present in `backend/package.json` and installed.
- Entry: `server.js` initializes Express, applies `cors`, `express.json`, and mounts routes; includes error and 404 handlers.
- DB: `config/db.js` creates a `pg.Pool` using `.env` variables; logs connect/error events.
- Env: `.env.example` contains `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `PORT`, optionally `JWT_EXPIRE`, `NODE_ENV`.
- Structure: `routes/`, `controllers/`, `middleware/`, `config/`, `sql/` exist and are wired.
- Scripts: `pnpm dev` runs `nodemon server.js`; `pnpm start` runs `node server.js`.

## Hardening (Non-breaking Enhancements)
- Add `/health` route that returns `{ status: 'ok' }` and (optional) checks DB (`SELECT 1`).
- CORS: configure allowed origins (frontend dev URL) rather than wildcard during development.
- Validation: use `express-validator` on auth and CRUD payloads (already in deps).
- Security: add `helmet` and basic rate limiting for auth/POST endpoints (optional).
- Logging: add `morgan` for request logs in `dev` only (optional).

## Deliverables
- Verified setup meeting Prompt 1 requirements.
- Optional health check endpoint and refined CORS config.
- Brief readme snippet in code comments for env variables (no separate docs unless requested).

## Acceptance Criteria
- Server starts and responds at `/` with a status message.
- DB pool connects successfully; `/health` returns `200` and, if DB check enabled, confirms connectivity.
- Env variables load; missing/invalid configs produce clear errors.
- No regressions in existing routes and middlewares.