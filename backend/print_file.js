const fs = require('fs');
const p = 'src/routes/student.routes.ts';
const s = fs.readFileSync(p, 'utf8').split(/\r?\n/);
s.forEach((l,i)=>{
  console.log((i+1).toString().padStart(4,' ')+': '+l);
});

