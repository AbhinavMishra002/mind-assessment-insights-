# Mind Assessment

This repository contains a small mental-health screening prototype with a backend (Node + Express + SQLite) and a simple frontend (static HTML/JS).

Structure

- `mental-health-backend/` — Node.js backend (serves frontend static files, SQLite DB at `db.sqlite`, and APIs)
  - `frontend/` — HTML files and client-side JS (index.html, admin.html)
  - `db.js`, `server.js` — DB init and server

How to run locally (development)

1. Change into the backend folder and install dependencies:

```powershell
cd "mental-health-backend"
npm install
```

2. Start the server (development):

```powershell
node server.js
# or, with nodemon (dev): npm run dev
```

3. Open `http://localhost:3000/` in your browser.

Notes

- The server seeds demo users on first run: `abhinav/abhinav123`, `astitva/astitva123`, `harsh/harsh123`, and `admin/admin123`.
- The SQLite DB (`db.sqlite`) and `logs/` may be present locally — they are excluded from the repository by `.gitignore`.

If you want me to create a GitHub repository for you and push the project automatically, I can attempt to do that if you have `gh` (GitHub CLI) authenticated on this machine, or I can provide step-by-step instructions for you to run the final push.
