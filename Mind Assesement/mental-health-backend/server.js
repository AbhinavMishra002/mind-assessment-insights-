// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { db, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
init();

// ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });

// HTTP request logging: to console (dev) and to file (combined)
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors());
app.use(express.json());

// ---------- Helper: simple token map (MVP, not secure) ----------
const tokenMap = new Map(); // token -> user object

// ---------- Seed demo users (only if not present) ----------
function seedDemoUsers(){
  // Ensure the DB contains exactly the desired demo/test accounts. If anything else exists
  // (or the set doesn't match), we will wipe users+submissions and create the four accounts below.
  const desired = [
    { id: 'u_abhinav', username: 'abhinav', name: 'Abhinav', password: 'abhinav123', role: 'student' },
    { id: 'u_astitva', username: 'astitva', name: 'Astitva', password: 'astitva123', role: 'student' },
    { id: 'u_harsh', username: 'harsh', name: 'Harsh', password: 'harsh123', role: 'student' },
    { id: 'u_admin', username: 'admin', name: 'Administrator', password: 'admin123', role: 'admin' }
  ];

  db.all(`SELECT username FROM users`, [], (err, rows) => {
    if (err) { console.error('seedDemoUsers: db error', err); return; }
    const existing = rows.map(r => r.username).sort();
    const target = desired.map(u => u.username).sort();
    // if they match exactly, do nothing
    if (existing.length === target.length && existing.every((v, i) => v === target[i])) {
      console.log('seedDemoUsers: users already match desired set. Skipping seed.');
      return;
    }

    // Otherwise, reset submissions and users then insert the desired set
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      try {
        db.run('DELETE FROM submissions');
        db.run('DELETE FROM users');

        const saltRounds = 10;
        const insertUser = (u) => {
          return bcrypt.hash(u.password, saltRounds).then(hash => {
            return new Promise((resolve, reject) => {
              db.run(`INSERT INTO users (id, username, name, password_hash, role) VALUES (?,?,?,?,?)`,
                [u.id, u.username, u.name, hash, u.role], function(err){
                  if(err) reject(err); else resolve();
                });
            });
          });
        };

        // insert users sequentially
        (async () => {
          for (const u of desired) {
            await insertUser(u);
          }
          db.run('COMMIT');
          console.log('seedDemoUsers: reset DB and seeded users:', target.join(', '));
        })().catch(e => {
          console.error('seedDemoUsers: error inserting users', e);
          db.run('ROLLBACK');
        });

      } catch (e) {
        console.error('seedDemoUsers: unexpected error', e);
        db.run('ROLLBACK');
      }
    });
  });
}
seedDemoUsers();

console.log('Server setup complete — logging enabled.');


app.post('/api/register', (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (row) return res.status(409).json({ error: 'username already exists' });

    const salt = bcrypt.genSaltSync(10);
    const pwd_hash = bcrypt.hashSync(password, salt);
    const userId = uuidv4();
    const role = 'student';

    db.run(
      `INSERT INTO users (id, username, name, password_hash, role) VALUES (?,?,?,?,?)`,
      [userId, username, name, pwd_hash, role],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error.' });
        return res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
});


// ---------- LOGIN ----------
app.post('/api/login', (req, res) => {
  console.log('Login attempt:', { username: req.body.username, timestamp: new Date().toISOString() });
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });

  db.get(`SELECT id, username, name, password_hash, role FROM users WHERE username = ?`, [username], (err,row)=>{
    if(err) return res.status(500).json({ error: 'db error' });
    if(!row) return res.status(401).json({ error: 'invalid credentials' });

    bcrypt.compare(password, row.password_hash).then(ok=>{
      if(!ok) return res.status(401).json({ error: 'invalid credentials' });

      // create simple token
      const token = uuidv4();
      tokenMap.set(token, { id: row.id, username: row.username, name: row.name, role: row.role });
      res.json({ success:true, token, user: { id: row.id, username: row.username, name: row.name, role: row.role } });
    });
  });
});

// ---------- Middleware: requireAuth ----------
function requireAuth(req, res, next){
  const token = req.headers['authorization']?.replace('Bearer ','') || req.query.token;
  if(!token) return res.status(401).json({ error: 'no token' });
  const user = tokenMap.get(token);
  if(!user) return res.status(401).json({ error: 'invalid token' });
  req.user = user;
  next();
}

// ---------- SUBMIT QUESTIONNAIRE ----------
app.post('/api/submissions', requireAuth, (req, res) => {
  console.log('New submission from user:', { userId: req.user.id, username: req.user.username, timestamp: new Date().toISOString() });
  // Expected body: { score: number, zone: 'white'|'yellow'|'red', answers: [ ... ] }
  const { score, zone, answers } = req.body;
  if(typeof score !== 'number' || !zone || !answers) return res.status(400).json({ error: 'missing fields' });

  const answersJson = JSON.stringify(answers);
  // Check if user already has a submission; if yes, update; else insert
  db.get("SELECT id FROM submissions WHERE user_id = ?", [req.user.id], (err,row)=>{
    if(err) return res.status(500).json({ error: 'db error' });
    if(row){
      db.run(`UPDATE submissions SET score=?, zone=?, answers=?, submitted_at=datetime('now') WHERE user_id=?`,
        [score, zone, answersJson, req.user.id], function(err2){
          if(err2) return res.status(500).json({ error: 'db error' });
          res.json({ success:true, updated:true });
        });
    } else {
      db.run(`INSERT INTO submissions (user_id, score, zone, answers) VALUES (?,?,?,?)`,
        [req.user.id, score, zone, answersJson], function(err2){
          if(err2) return res.status(500).json({ error: 'db error' });
          res.json({ success:true, insertedId: this.lastID });
        });
    }
  });
});

// ---------- GET ALL SUBMISSIONS (admin) ----------
app.get('/api/submissions', requireAuth, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });

  const sql = `SELECT s.id, s.user_id, u.name AS user_name, s.score, s.zone, s.answers, s.submitted_at
               FROM submissions s JOIN users u ON u.id = s.user_id
               ORDER BY s.submitted_at DESC`;
  db.all(sql, [], (err, rows) => {
    if(err) return res.status(500).json({ error: 'db error' });
    // parse answers JSON
    const out = rows.map(r => ({ ...r, answers: JSON.parse(r.answers) }));
    res.json(out);
  });
});

// ---------- GET SINGLE USER SUBMISSION ----------
app.get('/api/submissions/:userId', requireAuth, (req, res) => {
  const userId = req.params.userId;
  if(req.user.role !== 'admin' && req.user.id !== userId) return res.status(403).json({ error: 'forbidden' });

  db.get(`SELECT * FROM submissions WHERE user_id = ?`, [userId], (err,row)=>{
    if(err) return res.status(500).json({ error: 'db error' });
    if(!row) return res.status(404).json({ error: 'not found' });
    row.answers = JSON.parse(row.answers);
    res.json(row);
  });
});

// ---------- GET USERS (admin) ----------
app.get('/api/users', requireAuth, (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ error:'admin only' });
  db.all(`SELECT id, username, name, role, created_at FROM users ORDER BY username`, [], (err,rows)=>{
    if(err) return res.status(500).json({ error:'db error' });
    res.json(rows);
  });
});

// ---------- Optionally serve frontend if you put files in /frontend ----------
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req,res) => res.sendFile(path.join(__dirname, 'frontend','index.html')));

// ---------- ADMIN: download DB (admin only) ----------
app.get('/api/db/download', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  const dbPath = path.join(__dirname, 'db.sqlite');
  if (!fs.existsSync(dbPath)) return res.status(404).json({ error: 'db not found' });
  res.download(dbPath, 'db.sqlite');
});

// ---------- ADMIN: export submissions as CSV ----------
app.get('/api/export/submissions.csv', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  const sql = `SELECT s.id, s.user_id, u.username AS username, u.name AS user_name, s.score, s.zone, s.answers, s.submitted_at
               FROM submissions s JOIN users u ON u.id = s.user_id
               ORDER BY s.submitted_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    // Build CSV
    const header = ['id','user_id','username','user_name','score','zone','answers','submitted_at'];
    const lines = [header.join(',')];
    rows.forEach(r => {
      // escape quotes
      const answers = '"' + (r.answers || '').replace(/"/g, '""') + '"';
      const cols = [r.id, r.user_id, r.username, r.user_name, r.score, r.zone, answers, r.submitted_at];
      lines.push(cols.map(c => (c === null || c === undefined) ? '' : String(c)).join(','));
    });
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    res.send(csv);
  });
});

// Listen on localhost only (development). Revert to localhost so the app is served only on this machine.
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
