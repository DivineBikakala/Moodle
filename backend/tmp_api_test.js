const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const BASE = 'http://localhost:3001';

async function postJson(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token?{Authorization: 'Bearer '+token}: {}) },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch(e) { data = txt; }
  return { status: res.status, data };
}

async function getJson(path, token) {
  const res = await fetch(BASE + path, { headers: { ...(token?{Authorization: 'Bearer '+token}: {}) } });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch(e) { data = txt; }
  return { status: res.status, data };
}

(async ()=>{
  try {
    console.log('1) Register teacher');
    let r = await postJson('/api/auth/register', { email:'teacher_integ@example.com', username:'teacher_integ', password:'Prof1234', role:'teacher', firstName:'T', lastName:'I' });
    console.log('->', r.status, r.data);

    console.log('2) Login teacher');
    r = await postJson('/api/auth/login', { email:'teacher_integ@example.com', password:'Prof1234' });
    console.log('->', r.status);
    if (r.status !== 200) {
      console.log('Login failed, exiting');
      console.log(r.data); return;
    }
    const teacherToken = r.data.token;

    console.log('3) Create level');
    r = await postJson('/api/levels', { name:'Level 1', description:'Test level' }, teacherToken);
    console.log('->', r.status, r.data);
    const levelId = r.data && r.data.level && r.data.level.id ? r.data.level.id : (r.data && r.data.levelId) ? r.data.levelId : (r.data && r.data.level && r.data.levelId) ? r.data.level.levelId : null;
    console.log('levelId resolved:', levelId);

    console.log('4) Create resource for level');
    r = await postJson('/api/levels/'+levelId+'/resources', { title:'Doc 1', description:'doc', fileUrl:'http://example.com/doc1.pdf', fileType:'application/pdf', category:'notes', isVisible:true }, teacherToken);
    console.log('->', r.status, r.data);
    const resourceId = r.data && r.data.resource && r.data.resource.id ? r.data.resource.id : null;

    console.log('5) Register student');
    r = await postJson('/api/auth/register', { email:'student_integ@example.com', username:'student_integ', password:'Stud1234', role:'student', firstName:'S', lastName:'I', levelId }, null);
    console.log('->', r.status, r.data);

    console.log('6) Login student');
    r = await postJson('/api/auth/login', { email:'student_integ@example.com', password:'Stud1234' });
    console.log('->', r.status);
    const studentToken = r.data && r.data.token ? r.data.token : null;

    console.log('7) GET /api/my/resources (student)');
    r = await getJson('/api/my/resources', studentToken);
    console.log('->', r.status, r.data);

    console.log('8) Toggle resource visibility (patch to false)');
    r = await fetch(BASE+'/api/resources/'+resourceId, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+teacherToken }, body: JSON.stringify({ isVisible:false })});
    console.log('-> status', r.status);
    const after = await r.text(); console.log(after);

    console.log('9) GET /api/my/resources (student) after hide');
    r = await getJson('/api/my/resources', studentToken); console.log('->', r.status, r.data);

    console.log('10) DELETE resource');
    r = await fetch(BASE+'/api/resources/'+resourceId, { method:'DELETE', headers:{ Authorization:'Bearer '+teacherToken }});
    console.log('-> status', r.status);

    console.log('Done');
  } catch (e) {
    console.error('Error in script', e);
  }
})();

