// Lightweight test harness replicating scoring logic from index.html
const QUESTIONS = [
  // copy structure with scores arrays
];

// Build 20 questions with 0..3 scores (Q20 reverse but uses same scores)
for (let i=1;i<=20;i++){
  if (i===20) QUESTIONS.push({ id:i, scores: [0,1,2,3]});
  else QUESTIONS.push({ id:i, scores: [0,1,2,3]});
}

const MAX_SCORE = QUESTIONS.reduce((s, q) => s + Math.max(...(q.scores || [0])), 0);

function determineZone(totalScore){
  const symptomPct = (MAX_SCORE === 0) ? 0 : (totalScore / MAX_SCORE) * 100;
  const healthPct = 100 - symptomPct;
  if (healthPct >= 70) return { level: 'good', zone: 'green', label: 'Healthy' };
  if (healthPct >= 40) return { level: 'medium', zone: 'yellow', label: 'Moderate' };
  return { level: 'low', zone: 'red', label: 'Needs attention' };
}

function healthPctForAnswers(answerIndices){
  // answerIndices: array of indices 0..3 per question
  let total = 0;
  for (let i=0;i<QUESTIONS.length;i++){
    const sel = answerIndices[i] || 0;
    const s = QUESTIONS[i].scores[sel];
    total += s;
  }
  const symptomPct = (MAX_SCORE === 0) ? 0 : (total / MAX_SCORE) * 100;
  const healthPct = 100 - symptomPct;
  return { total, symptomPct, healthPct, zone: determineZone(total)};
}

// Tests
console.log('MAX_SCORE', MAX_SCORE);
// Best case: choose healthiest answers: for negative Qs, select 0 -> Not at all; for Q20 reversed choose 0 "Nearly every day" (healthy) -> score 0
const bestAnswers = new Array(20).fill(0);
console.log('Best case', healthPctForAnswers(bestAnswers));

// Worst case: select the highest severity for all (sel=3)
const worstAnswers = new Array(20).fill(3);
console.log('Worst case', healthPctForAnswers(worstAnswers));

// The user case: clicked 'Nearly every day' which for negative questions corresponds to sel=3. Use all negative 'Nearly every day' (sel=3)
const userCase = new Array(20).fill(3);
console.log('User all nearly every day', healthPctForAnswers(userCase));

// Mixed case: all negative 'Nearly every day' but Q20 answered as 'Nearly every day' too (sel=0) -> but since Q20 reversed, sel=0 is healthy (score 0). Simulate user said they clicked nearly every day for negative questions and maybe also for Q20 - if Q20 is 'Nearly every day' it's healthy, but user might have misclicked.
const mix = new Array(20).fill(3);
mix[19] = 0; // Q20 sel 0 (nearly every day -> healthy)
console.log('All negative worst but Q20 healthy', healthPctForAnswers(mix));
