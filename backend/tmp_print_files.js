const fs = require('fs');
const files = [
  './src/routes/level.routes.ts',
  './src/routes/student.routes.ts'
];
for (const f of files) {
  console.log('---', f, '---');
  const s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  lines.forEach((l,i) => console.log((i+1).toString().padStart(3,' ')+': '+l));
  console.log('\nHEX PREVIEW:');
  console.log(Buffer.from(s,'utf8').toString('hex').slice(0,800));
}

