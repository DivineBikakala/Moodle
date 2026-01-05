const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE = 'http://localhost:3001';

function unique(s) {
  return `${s}_${Date.now()}`;
}

async function tryRegister() {
  const body = {
    email: unique('teacher') + '@test.local',
    username: unique('teacher'),
    password: 'password123',
    firstName: 'Prof',
    lastName: 'Test',
    role: 'teacher'
  };

  const res = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log('REGISTER', res.status, text);
}

async function login(email, password) {
  const res = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  console.log('LOGIN', res.status, json.message || json.error || json);
  return json.token;
}

async function createStudent(token) {
  const uname = unique('student');
  const body = {
    username: uname,
    email: uname + '@test.local',
    password: 'studpass1',
    firstName: 'Etudiant',
    lastName: 'Un',
    level: 1
  };
  const res = await fetch(BASE + '/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log('CREATE_STUDENT', res.status, text);
}

(async () => {
  try {
    // register unique teacher and immediately login with returned credentials
    const email = unique('teacher') + '@test.local';
    const username = unique('teacher');
    const password = 'password123';

    // Register
    const regRes = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, firstName: 'Prof', lastName: 'Test', role: 'teacher' })
    });
    console.log('REGISTER', regRes.status, await regRes.text());

    // Login
    const token = await login(email, password);
    if (token) {
      await createStudent(token);
    } else {
      console.error('No token, aborting student creation');
    }
  } catch (e) {
    console.error('ERROR', e.message || e);
  }
})();
