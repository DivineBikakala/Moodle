const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async ()=>{
  try{
    const login = await fetch('http://localhost:3001/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'teacher_integ@example.com',password:'Prof1234'})});
    const lj = await login.json();
    console.log('login status', login.status);
    const token = lj.token;
    const res = await fetch('http://localhost:3001/api/levels',{headers:{Authorization:'Bearer '+token}});
    const data = await res.json();
    console.log('levels:', JSON.stringify(data.levels, null, 2));
  }catch(e){console.error(e)}
})();

