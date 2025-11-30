// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'db.sqlite');

const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      zone TEXT NOT NULL,
      answers TEXT NOT NULL,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  });
}

module.exports = { db, init };
