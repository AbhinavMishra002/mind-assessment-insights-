Mental Health Backend (MVP)

This is a minimal Node.js + Express + SQLite backend for the mental-health front-end prototype.

Quick start

1. Move into the folder:

   cd "c:\Mind Assesement\mental-health-backend"

2. Install dependencies:

   npm install

3. Start the server:

   npm run dev # requires nodemon (dev) or
   node server.js

The server will create `db.sqlite` and seed demo users: `abhinav/abhinav123`, `astitva/astitva123`, `harsh/harsh123`, and `admin/admin123` (admin role).

API endpoints (all prefixed with /api):

- POST /api/login { username, password } => { success, token, user }
- POST /api/submissions (auth required) => save or update student's submission
- GET /api/submissions (admin only) => list submissions
- GET /api/submissions/:userId => get a user's submission (owner or admin)
- GET /api/users (admin only) => list users

Frontend

Drop your `index.html` into `frontend/` and the server will serve it at http://localhost:3000/ .

Notes

- Scoring & UI: The backend stores a numeric `score` where higher means more symptoms (worse). The frontend now displays a health-oriented meter: it inverts the stored score into a "percent healthy" so that higher meter values represent better health. Zones are now mapped: green = Healthy, yellow = Moderate, red = Needs attention.

This uses an in-memory token map for simplicity (not secure). For production use JWTs or server sessions and proper auth flows.
