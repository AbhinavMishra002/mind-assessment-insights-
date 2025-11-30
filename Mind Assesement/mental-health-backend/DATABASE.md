# Database Structure

The SQLite database is located at: `c:\Mind Assesement\mental-health-backend\db.sqlite`

To view the database contents:

1. Download and install "DB Browser for SQLite" from: https://sqlitebrowser.org/dl/
2. Open DB Browser for SQLite
3. Click "Open Database" and navigate to the db.sqlite file
4. You can then view:
   - Users table: Contains all user accounts
   - Submissions table: Contains all questionnaire submissions
     Opening or copying the DB on another device

---

- The database is a single file: `db.sqlite`. You can copy this file to another machine and open it with DB Browser.
- IMPORTANT: If the server (Node.js) is running and writing to the database, do NOT copy the file while it's in use — you risk getting a corrupted copy. Safest options:
  1. Stop the server before copying the file. In PowerShell: `Stop-Process -Name node -Force` (or close the terminal running the server).
  2. Use DB Browser's "Export" features instead: File → Export → Database to SQL file (or Table(s) to CSV). Exporting does not require stopping the server.
  3. If you need live remote access, consider migrating from SQLite to a client-server database (Postgres, MySQL) which supports concurrent remote connections.

## Copying the file over the network

- Use a secure method: SCP/SFTP, a shared network drive, or a simple file copy over USB. Example (PowerShell copy to network share):

  Copy-Item -Path "C:\Mind Assesement\mental-health-backend\db.sqlite" -Destination "\\remote-machine\share\db.sqlite"

- If you need me to add an endpoint that lets you download the DB directly from the server, I added `/api/db/download` (admin only) which returns `db.sqlite` as an attachment. Use the admin dashboard at `/admin.html` to log in and download safely.

## Exporting submissions as CSV

- I added an endpoint `/api/export/submissions.csv` (admin only) that returns all submissions in CSV format. You can download it from the admin page or call it with an Authorization header.

## DB Browser link

- Official downloads: https://sqlitebrowser.org/dl/

If you want, I can:

- Walk you through copying the file to another device step-by-step over your preferred method (USB, network share, SCP).
- Add an authenticated download link that expires, or generate a zipped export automatically.

Tables structure:

- users

  - id (TEXT PRIMARY KEY)
  - username (TEXT)
  - name (TEXT)
  - password_hash (TEXT)
  - role (TEXT)
  - created_at (TEXT)

- submissions
  - id (INTEGER PRIMARY KEY)
  - user_id (TEXT)
  - score (INTEGER)
  - zone (TEXT)
  - answers (TEXT)
  - submitted_at (TEXT)
