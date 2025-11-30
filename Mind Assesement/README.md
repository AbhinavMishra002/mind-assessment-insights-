# Mind Assessment — Mental Health Screening Prototype

A lightweight prototype of a mental-health screening system. The project includes a Node.js + Express backend with SQLite storage and a minimal static frontend (HTML + JS) used to submit and view screening results.

This repo is a small, educational prototype intended to demonstrate how a simple assessment app can be built and run locally. It is not production-ready and is meant for testing, learning, or prototyping only.

Highlights

- Simple backend API with authentication and role-based endpoints (admin vs user)
- Static frontend served by the backend for easy testing
- SQLite DB with seed demo users for quick local testing

Repository structure

- `mental-health-backend/` — Node.js backend and API
  - `frontend/` — Static HTML pages and client-side JavaScript (`index.html` and `admin.html`)
  - `server.js`, `db.js` — application entry & DB helpers

Getting started (Windows / PowerShell)

1. Open PowerShell at the repo root (example):

```powershell
cd "C:\Users\mishr\Downloads\mind_assessment_fixed_final\Mind Assesement"
```

2. Install dependencies and run the server:

```powershell
cd "mental-health-backend"
npm install
# Start (production) or use dev with nodemon:
npm start
# or
npm run dev
```

3. Visit the app in a browser:

http://localhost:3000/

Seeded demo accounts

The backend seeds some demo users on first run (useful for testing the UI and admin features):

- Username: `abhinav` / Password: `abhinav123` (user)
- Username: `astitva` / Password: `astitva123` (user)
- Username: `harsh` / Password: `harsh123` (user)
- Username: `admin` / Password: `admin123` (admin)

API endpoints (overview)

All API endpoints are prefixed with `/api`.

- POST `/api/login` — body: { username, password } → authenticates and returns a token
- POST `/api/submissions` — auth required; create/update a user's screening submission
- GET `/api/submissions` — admin only; list all submissions
- GET `/api/submissions/:userId` — owner or admin; get a user's submission
- GET `/api/users` — admin only; list users

Notes about scoring & UI

- The backend stores a numeric `score` where higher indicates more symptoms (worse).
- The frontend displays a "percent healthy" meter by inverting the stored score so higher meter values visually represent better health.
- The UI maps meter zones: green = Healthy, yellow = Moderate, red = Needs attention.

Security

This prototype uses a simple in-memory token map and is intentionally lightweight for demo purposes only. Do not use this authentication approach in production. For production, use JWTs or server-backed sessions and secure credential handling.

Development notes

- Node.js + Express server
- SQLite database (db.sqlite) created on first run
- Uses `bcrypt` for password hashing, `uuid` for tokens, `morgan` for logging, `cors` for CORS handling

Testing

There are basic test helper files in `mental-health-backend/` (e.g. `test_admin_api.js`, `test_submit_fetch.js`) to exercise the API. These are not full test suites but useful for manual checks.

Contributing

If you'd like to improve this project, consider:

- Adding a proper authentication system (JWT or session-based)
- Adding a frontend build process and modern UI
- Adding proper unit and integration tests
- Adding environment handling for production-grade deployments

How to push to GitHub

If you haven't already created a GitHub repo and pushed this project, the basic steps are:

```powershell
# initialize (if not already done)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

License & contact

This project is provided as-is for learning and prototyping. Add a license (e.g., MIT) if you plan to make the repository public. For questions, contact the repository owner or the project maintainer.

---

If you'd like, I can now:

- add a clear LICENSE file (MIT),
- improve the frontend README or split developer notes into separate docs, or
- update the repo with a polished GitHub release README and badges.

Tell me which of the above you'd like next and I'll continue.
