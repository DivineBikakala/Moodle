(async () => {
  const base = 'http://localhost:3001';
  const headersJson = { 'Content-Type': 'application/json' };

  function log(title, obj) {
    console.log('\n=== ' + title + ' ===');
    try { console.log(JSON.stringify(obj, null, 2)); } catch (e) { console.log(obj); }
  }

  try {
    // 1) Register teacher
    let res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: headersJson,
      body: JSON.stringify({ email: 'teacher@example.com', password: 'Password123!', firstName: 'Alice', lastName: 'Teacher', role: 'teacher' })
    });
    const teacher = await res.json();
    log('teacher register status ' + res.status, teacher);
    const teacherToken = teacher.token;
    const teacherId = teacher.user?.id || (teacher.user && teacher.user.id);

    // 2) Register student
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: headersJson,
      body: JSON.stringify({ email: 'student@example.com', password: 'Password123!', firstName: 'Bob', lastName: 'Student', role: 'student' })
    });
    const student = await res.json();
    log('student register status ' + res.status, student);
    const studentToken = student.token;
    const studentId = student.user?.id || (student.user && student.user.id);

    // 3) Create a course
    res = await fetch(base + '/api/courses', {
      method: 'POST',
      headers: headersJson,
      body: JSON.stringify({ title: 'Intro to Testing', description: 'Test course', teacherId: teacherId })
    });
    const courseCreated = await res.json();
    log('create course status ' + res.status, courseCreated);
    const courseId = courseCreated.course?.id || (courseCreated && courseCreated.course && courseCreated.course.id);

    // 4) List courses
    res = await fetch(base + '/api/courses');
    const courses = await res.json();
    log('courses list', courses);

    // 5) Add resource (teacher auth)
    res = await fetch(base + '/api/courses/' + courseId + '/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + teacherToken },
      body: JSON.stringify({ title: 'Syllabus', description: 'Course syllabus', fileUrl: 'https://example.com/syllabus.pdf', fileType: 'application/pdf' })
    });
    const resource = await res.json();
    log('add resource status ' + res.status, resource);

    // 6) Enroll student (student auth)
    res = await fetch(base + '/api/courses/' + courseId + '/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + studentToken }
    });
    const enrollment = await res.json();
    log('enroll status ' + res.status, enrollment);

    // 7) Get my-courses for student
    res = await fetch(base + '/api/my-courses', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + studentToken }
    });
    const myCourses = await res.json();
    log('my-courses', myCourses);

    console.log('\nTest script finished.');
  } catch (err) {
    console.error('Test script error:', err);
  }
})();

