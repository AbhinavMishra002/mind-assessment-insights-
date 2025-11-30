const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite', (err) => { if(err) { console.error('open err', err); process.exit(1); }});

db.all('SELECT id, username, name, role FROM users ORDER BY username', [], (err, rows) => {
  if (err) { console.error('query err', err); process.exit(1); }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
