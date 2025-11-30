const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
db.get('SELECT COUNT(1) AS c FROM submissions', [], (err, row) => { if(err){ console.error(err); process.exit(1);} console.log(row); db.close(); });
