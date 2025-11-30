const fetch = require('node-fetch');
(async ()=>{
  const base = 'http://localhost:3000';
  // login as abhinav
  const l1 = await fetch(base + '/api/login', { method:'POST', headers:{ 'Content-Type':'application/json'}, body: JSON.stringify({ username:'abhinav', password:'abhinav123' }) });
  const j1 = await l1.json();
  console.log('abhinav login ->', j1.user && j1.user.username);
  const token = j1.token;
  // submit a healthy record (total 0) -> zone should be 'green'
  const rec = { userId: j1.user.id, score: 0, zone: 'green', suggestion: 'Test healthy', answers: [] };
  const sRes = await fetch(base + '/api/submissions', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(rec) });
  const sJ = await sRes.json();
  console.log('submit ->', sRes.status, sJ);

  // now login as admin and fetch all submissions
  const la = await fetch(base + '/api/login', { method:'POST', headers:{ 'Content-Type':'application/json'}, body: JSON.stringify({ username:'admin', password:'admin123' }) });
  const ja = await la.json();
  const tokenA = ja.token;
  const all = await (await fetch(base + '/api/submissions', { headers: { Authorization: 'Bearer ' + tokenA } })).json();
  console.log('admin fetched', all.filter(x=>x.user_id === j1.user.id));
})();
