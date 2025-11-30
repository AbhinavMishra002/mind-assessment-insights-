const fetch = require('node-fetch');
(async ()=>{
  try {
    const base = 'http://localhost:3000';
    const loginRes = await fetch(base + '/api/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username: 'admin', password: 'admin123' }) });
    const loginJson = await loginRes.json();
    if(!loginRes.ok) return console.error('login failed', loginJson);
    console.log('login ok:', loginJson.user.username, 'role:', loginJson.user.role);
    const token = loginJson.token;
    const usersRes = await fetch(base + '/api/users', { headers: { Authorization: 'Bearer ' + token } });
    const users = await usersRes.json();
    console.log('GET /api/users ->', users);
  } catch (e) { console.error('error', e); process.exit(1);} 
})();
