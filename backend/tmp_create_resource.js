const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async ()=>{
  const login = await fetch('http://localhost:3001/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'teacher_integ@example.com',password:'Prof1234'})});
  const lj = await login.json();
  const token = lj.token;
  console.log('token', Boolean(token));
  const res = await fetch('http://localhost:3001/api/levels/1/resources',{method:'POST',headers:{'Content-Type':'application/json', Authorization:'Bearer '+token},body:JSON.stringify({title:'Test API',description:'t',fileUrl:'http://example.com/test.pdf',fileType:'application/pdf',category:'notes',isVisible:true})});
  console.log('status', res.status);
  console.log(await res.text());
})();

