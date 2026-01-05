const fs = require('fs');
const p = 'src/routes/student.routes.ts';
const b = fs.readFileSync(p);
const s = b.toString('utf8');
console.log('File length:', b.length);
const regex = /level/g;
let m;
while((m = regex.exec(s)) !== null){
  const idx = m.index;
  const start = Math.max(0, idx-30);
  const end = Math.min(s.length, idx+30);
  const snippet = s.slice(start,end);
  const hex = Buffer.from(snippet,'utf8').toString('hex');
  console.log('\n--- occurrence at', idx, '---');
  console.log('snippet:', JSON.stringify(snippet));
  console.log('hex:', hex);
}
if (!s.includes('level')) console.log('No "level" found as substring.');

