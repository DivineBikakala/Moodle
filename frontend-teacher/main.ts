// Configuration API
const API_URL = 'http://localhost:3001/api';

// Types
interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  level?: number;
}

interface Student extends User {
  role: 'student';
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  id: number;
  courseId: number;
  levelId?: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: 'notes' | 'exercices' | 'examen';
  isVisible: boolean;
  uploadedAt: string;
}

interface Level {
  id: number;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
}

interface Schedule {
  id: number;
  teacherId: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
}

// State management
let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem('authToken');
let students: Student[] = [];
let courses: Course[] = [];
let levels: Level[] = [];
let schedules: Schedule[] = [];
let selectedStudent: Student | null = null;
let selectedLevel: Level | null = null;
let currentTab: 'courses' | 'students' | 'levels' | 'schedule' = 'courses';

// Initialize app
function init() {
  if (authToken) {
    verifyToken();
  } else {
    showAuthPage();
  }
}

// API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || 'Erreur serveur');
  }

  return response.json();
}

async function verifyToken() {
  try {
    const data = await apiCall('/auth/me');
    currentUser = data.user;
    showDashboard();
  } catch (error) {
    localStorage.removeItem('authToken');
    authToken = null;
    showAuthPage();
  }
}

async function login(email: string, password: string) {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('authToken', authToken!);
  showDashboard();
}

async function register(email: string, username: string, password: string, firstName: string, lastName: string) {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password, firstName, lastName, role: 'teacher' }),
  });

  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('authToken', authToken!);
  showDashboard();
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  showAuthPage();
}

// Students API
async function loadStudents() {
  const data = await apiCall('/students');
  students = data.students;
  renderStudents();
}

async function createStudent(studentData: any) {
  await apiCall('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
  loadStudents();
}

async function updateStudent(id: number, studentData: any) {
  await apiCall(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
  loadStudents();
}

async function deleteStudent(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
    await apiCall(`/students/${id}`, { method: 'DELETE' });
    loadStudents();
  }
}

// Courses API
async function loadCourses() {
  const data = await apiCall('/courses');
  courses = data.courses.filter((c: Course) => c.teacherId === currentUser?.id);
  renderCourses();
}

async function createCourse(title: string, description: string, isPublished: boolean) {
  await apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify({ title, description, isPublished }),
  });
  loadCourses();
}

async function updateCourse(id: number, title: string, description: string, isPublished: boolean) {
  await apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, isPublished }),
  });
  loadCourses();
}

async function deleteCourse(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
    await apiCall(`/courses/${id}`, { method: 'DELETE' });
    loadCourses();
  }
}

// Levels API
async function loadLevels() {
  const data = await apiCall('/levels');
  levels = data.levels;
  renderLevels();
}

async function createLevel(name: string, description: string) {
  await apiCall('/levels', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  loadLevels();
}

async function deleteLevel(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) {
    await apiCall(`/levels/${id}`, { method: 'DELETE' });
    loadLevels();
  }
}

// Schedule API
async function loadSchedules() {
  const data = await apiCall('/schedules');
  schedules = data.schedules;
  renderSchedules();
}

async function createSchedule(scheduleData: any) {
  await apiCall('/schedules', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });
  loadSchedules();
}

async function deleteSchedule(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) {
    await apiCall(`/schedules/${id}`, { method: 'DELETE' });
    loadSchedules();
  }
}

// UI Rendering
function showAuthPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>📚 Portail Enseignant</h1>
          <p>Connectez-vous pour gérer votre plateforme</p>
        </div>
        <div id="auth-error"></div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="email" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input type="password" id="password" class="form-input" required />
          </div>
          <button type="submit" class="btn btn-primary">Se connecter</button>
        </form>
        <button id="show-register" class="btn btn-secondary">Créer un compte</button>
      </div>
    </div>
  `;

  document.getElementById('login-form')!.addEventListener('submit', handleLogin);
  document.getElementById('show-register')!.addEventListener('click', showRegisterForm);
}

function showRegisterForm() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>📚 Créer un compte</h1>
          <p>Inscrivez-vous en tant qu'enseignant</p>
        </div>
        <div id="auth-error"></div>
        <form id="register-form">
          <div class="form-group">
            <label class="form-label">Prénom</label>
            <input type="text" id="firstName" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input type="text" id="lastName" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <input type="text" id="username" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="email" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input type="password" id="password" class="form-input" required />
          </div>
          <button type="submit" class="btn btn-primary">S'inscrire</button>
        </form>
        <button id="show-login" class="btn btn-secondary">Retour à la connexion</button>
      </div>
    </div>
  `;

  document.getElementById('register-form')!.addEventListener('submit', handleRegister);
  document.getElementById('show-login')!.addEventListener('click', showAuthPage);
}

function showDashboard() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <div class="navbar-content">
          <div class="navbar-brand">
            <div class="navbar-brand-icon">📚</div>
            <div>
              <div>Portail de cours</div>
              <div style="font-size: 12px; font-weight: 400; opacity: 0.8;">Espace Professeur</div>
            </div>
          </div>
          <div class="navbar-right">
            <span class="user-info">${currentUser?.firstName} ${currentUser?.lastName}</span>
            <button id="btn-logout" class="btn-logout">Déconnexion</button>
          </div>
        </div>
      </nav>
      
      <div class="nav-tabs">
        <button class="nav-tab ${currentTab === 'courses' ? 'active' : ''}" data-tab="courses">
          <span class="nav-tab-icon">📖</span>
          Cours
        </button>
        <button class="nav-tab ${currentTab === 'students' ? 'active' : ''}" data-tab="students">
          <span class="nav-tab-icon">👥</span>
          Étudiants
        </button>
        <button class="nav-tab ${currentTab === 'levels' ? 'active' : ''}" data-tab="levels">
          <span class="nav-tab-icon">📊</span>
          Niveaux
        </button>
        <button class="nav-tab ${currentTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
          <span class="nav-tab-icon">📅</span>
          Horaire
        </button>
      </div>
      
      <div class="container" id="tab-content"></div>
    </div>
  `;

  document.getElementById('btn-logout')!.addEventListener('click', logout);

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = (e.currentTarget as HTMLElement).dataset.tab as any;
      switchTab(tabName);
    });
  });

  loadTabContent(currentTab);
}

function switchTab(tab: typeof currentTab) {
  currentTab = tab;
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('data-tab') === tab) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  loadTabContent(tab);
}

function loadTabContent(tab: typeof currentTab) {
  switch (tab) {
    case 'courses':
      loadCourses();
      break;
    case 'students':
      loadStudents();
      break;
    case 'levels':
      loadLevels();
      break;
    case 'schedule':
      loadSchedules();
      break;
  }
}

function renderCourses() {
  const container = document.getElementById('tab-content')!;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Mes Cours</h2>
        <p class="section-subtitle">Gérez vos cours et ressources pédagogiques</p>
      </div>
      <button id="btn-add-course" class="btn btn-accent">+ Nouveau cours</button>
    </div>
    <div id="courses-list" class="grid grid-2"></div>
  `;

  document.getElementById('btn-add-course')!.addEventListener('click', () => showCourseModal());

  const coursesList = document.getElementById('courses-list')!;

  if (courses.length === 0) {
    coursesList.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours créé</h3>
        <p>Commencez par créer votre premier cours</p>
      </div>
    `;
    return;
  }

  coursesList.innerHTML = courses.map(course => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${course.title}</h3>
        <span class="card-badge ${course.isPublished ? 'badge-published' : 'badge-draft'}">
          ${course.isPublished ? '✓ Publié' : 'Brouillon'}
        </span>
      </div>
      <p class="card-description">${course.description}</p>
      <div class="card-actions">
        <button class="btn btn-sm btn-primary" onclick="editCourse(${course.id})">✏️ Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCourseHandler(${course.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}

function renderStudents() {
  const container = document.getElementById('tab-content')!;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Gestion des Étudiants</h2>
        <p class="section-subtitle">Ajoutez et gérez les comptes étudiants</p>
      </div>
      <button id="btn-add-student" class="btn btn-accent">+ Nouvel étudiant</button>
    </div>
    <div id="students-list"></div>
  `;

  document.getElementById('btn-add-student')!.addEventListener('click', () => showStudentModal());

  const studentsList = document.getElementById('students-list')!;

  if (students.length === 0) {
    studentsList.innerHTML = `
      <div class="empty-state">
        <h3>Aucun étudiant</h3>
        <p>Ajoutez votre premier étudiant pour commencer</p>
      </div>
    `;
    return;
  }

  studentsList.innerHTML = students.map(student => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${student.firstName} ${student.lastName}</div>
        <div class="list-item-subtitle">
          @${student.username} • ${student.email}${student.phone ? ' • ' + student.phone : ''} • 
          <span class="badge-level">Niveau ${student.level || 0}</span>
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-sm btn-primary" onclick="editStudent(${student.id})">✏️ Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStudentHandler(${student.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}

function renderLevels() {
  const container = document.getElementById('tab-content')!;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Niveaux d'Apprentissage</h2>
        <p class="section-subtitle">Organisez les contenus par niveau de difficulté</p>
      </div>
      <button id="btn-add-level" class="btn btn-accent">+ Nouveau niveau</button>
    </div>
    <div id="levels-list" class="grid grid-3"></div>
  `;

  document.getElementById('btn-add-level')!.addEventListener('click', () => showLevelModal());

  const levelsList = document.getElementById('levels-list')!;

  if (levels.length === 0) {
    levelsList.innerHTML = `
      <div class="empty-state">
        <h3>Aucun niveau créé</h3>
        <p>Créez des niveaux pour organiser vos ressources</p>
      </div>
    `;
    return;
  }

  levelsList.innerHTML = levels.map(level => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${level.name}</h3>
        <span class="badge-level">Niveau ${level.order}</span>
      </div>
      <p class="card-description">${level.description || 'Pas de description'}</p>
      <div class="card-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteLevelHandler(${level.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}

function renderSchedules() {
  const container = document.getElementById('tab-content')!;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Mon Horaire</h2>
        <p class="section-subtitle">Gérez votre emploi du temps et vos cours programmés</p>
      </div>
      <button id="btn-add-schedule" class="btn btn-accent">+ Nouveau cours</button>
    </div>
    <div id="schedules-list"></div>
  `;

  document.getElementById('btn-add-schedule')!.addEventListener('click', () => showScheduleModal());

  const schedulesList = document.getElementById('schedules-list')!;

  if (schedules.length === 0) {
    schedulesList.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours programmé</h3>
        <p>Ajoutez des cours à votre horaire</p>
      </div>
    `;
    return;
  }

  schedulesList.innerHTML = schedules.map(schedule => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${schedule.title}</div>
        <div class="list-item-subtitle">
          📅 ${formatDate(schedule.date)} • ⏰ ${schedule.startTime} - ${schedule.endTime}
          ${schedule.location ? ' • 📍 ' + schedule.location : ''}
        </div>
        ${schedule.description ? `<div style="margin-top: 8px; font-size: 13px;">${schedule.description}</div>` : ''}
      </div>
      <div class="list-item-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteScheduleHandler(${schedule.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}

// Modals
function showCourseModal(course?: Course) {
  const isEdit = !!course;
  const modalHTML = `
    <div class="modal" id="course-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>${isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h2>
          <button class="btn-close" onclick="closeModal('course-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div id="modal-error"></div>
          <form id="course-form">
            <div class="form-group">
              <label class="form-label">Titre</label>
              <input type="text" id="course-title" class="form-input" value="${course?.title || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="course-description" class="form-textarea" required>${course?.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="course-published" class="form-checkbox" ${course?.isPublished ? 'checked' : ''} />
                Publier ce cours
              </label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal('course-modal')">Annuler</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('course-form')!.addEventListener('submit', (e) => handleCourseSubmit(e, course));
}

function showStudentModal(student?: Student) {
  const isEdit = !!student;
  const modalHTML = `
    <div class="modal" id="student-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>${isEdit ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}</h2>
          <button class="btn-close" onclick="closeModal('student-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div id="modal-error"></div>
          <form id="student-form">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input type="text" id="student-firstName" class="form-input" value="${student?.firstName || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input type="text" id="student-lastName" class="form-input" value="${student?.lastName || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom d'utilisateur</label>
              <input type="text" id="student-username" class="form-input" value="${student?.username || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="student-email" class="form-input" value="${student?.email || ''}" required />
            </div>
            ${!isEdit ? `
            <div class="form-group">
              <label class="form-label">Mot de passe temporaire</label>
              <input type="password" id="student-password" class="form-input" required />
              <small style="color: var(--gray-500); font-size: 12px;">L'étudiant pourra le changer après connexion</small>
            </div>
            ` : ''}
            <div class="form-group">
              <label class="form-label">Téléphone (optionnel)</label>
              <input type="tel" id="student-phone" class="form-input" value="${student?.phone || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Niveau</label>
              <input type="number" id="student-level" class="form-input" value="${student?.level || 0}" min="0" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal('student-modal')">Annuler</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('student-form')!.addEventListener('submit', (e) => handleStudentSubmit(e, student));
}

function showLevelModal() {
  const modalHTML = `
    <div class="modal" id="level-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nouveau niveau</h2>
          <button class="btn-close" onclick="closeModal('level-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div id="modal-error"></div>
          <form id="level-form">
            <div class="form-group">
              <label class="form-label">Nom du niveau</label>
              <input type="text" id="level-name" class="form-input" placeholder="Ex: Niveau Débutant" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="level-description" class="form-textarea" placeholder="Description du niveau"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal('level-modal')">Annuler</button>
              <button type="submit" class="btn btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('level-form')!.addEventListener('submit', handleLevelSubmit);
}

function showScheduleModal() {
  const modalHTML = `
    <div class="modal" id="schedule-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nouveau cours programmé</h2>
          <button class="btn-close" onclick="closeModal('schedule-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div id="modal-error"></div>
          <form id="schedule-form">
            <div class="form-group">
              <label class="form-label">Titre du cours</label>
              <input type="text" id="schedule-title" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description (optionnelle)</label>
              <textarea id="schedule-description" class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" id="schedule-date" class="form-input" required />
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Heure de début</label>
                <input type="time" id="schedule-startTime" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin</label>
                <input type="time" id="schedule-endTime" class="form-input" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Lieu (optionnel)</label>
              <input type="text" id="schedule-location" class="form-input" placeholder="Ex: Salle 101" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal('schedule-modal')">Annuler</button>
              <button type="submit" class="btn btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('schedule-form')!.addEventListener('submit', handleScheduleSubmit);
}

function closeModal(modalId: string) {
  document.getElementById(modalId)?.remove();
}

// Event handlers
async function handleLogin(e: Event) {
  e.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const errorDiv = document.getElementById('auth-error')!;

  try {
    await login(email, password);
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleRegister(e: Event) {
  e.preventDefault();
  const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
  const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
  const username = (document.getElementById('username') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const errorDiv = document.getElementById('auth-error')!;

  try {
    await register(email, username, password, firstName, lastName);
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleCourseSubmit(e: Event, course?: Course) {
  e.preventDefault();
  const title = (document.getElementById('course-title') as HTMLInputElement).value;
  const description = (document.getElementById('course-description') as HTMLTextAreaElement).value;
  const isPublished = (document.getElementById('course-published') as HTMLInputElement).checked;
  const errorDiv = document.getElementById('modal-error')!;

  try {
    if (course) {
      await updateCourse(course.id, title, description, isPublished);
    } else {
      await createCourse(title, description, isPublished);
    }
    closeModal('course-modal');
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleStudentSubmit(e: Event, student?: Student) {
  e.preventDefault();
  const errorDiv = document.getElementById('modal-error')!;

  try {
    const studentData = {
      firstName: (document.getElementById('student-firstName') as HTMLInputElement).value,
      lastName: (document.getElementById('student-lastName') as HTMLInputElement).value,
      username: (document.getElementById('student-username') as HTMLInputElement).value,
      email: (document.getElementById('student-email') as HTMLInputElement).value,
      phone: (document.getElementById('student-phone') as HTMLInputElement).value || undefined,
      level: parseInt((document.getElementById('student-level') as HTMLInputElement).value, 10),
    };

    if (!student) {
      (studentData as any).password = (document.getElementById('student-password') as HTMLInputElement).value;
      await createStudent(studentData);
    } else {
      await updateStudent(student.id, studentData);
    }
    closeModal('student-modal');
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleLevelSubmit(e: Event) {
  e.preventDefault();
  const name = (document.getElementById('level-name') as HTMLInputElement).value;
  const description = (document.getElementById('level-description') as HTMLTextAreaElement).value;
  const errorDiv = document.getElementById('modal-error')!;

  try {
    await createLevel(name, description);
    closeModal('level-modal');
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleScheduleSubmit(e: Event) {
  e.preventDefault();
  const errorDiv = document.getElementById('modal-error')!;

  try {
    const scheduleData = {
      title: (document.getElementById('schedule-title') as HTMLInputElement).value,
      description: (document.getElementById('schedule-description') as HTMLTextAreaElement).value || undefined,
      date: (document.getElementById('schedule-date') as HTMLInputElement).value,
      startTime: (document.getElementById('schedule-startTime') as HTMLInputElement).value,
      endTime: (document.getElementById('schedule-endTime') as HTMLInputElement).value,
      location: (document.getElementById('schedule-location') as HTMLInputElement).value || undefined,
    };

    await createSchedule(scheduleData);
    closeModal('schedule-modal');
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

// Global functions for onclick handlers
(window as any).editCourse = (id: number) => {
  const course = courses.find(c => c.id === id);
  if (course) showCourseModal(course);
};

(window as any).deleteCourseHandler = (id: number) => {
  deleteCourse(id);
};

(window as any).editStudent = (id: number) => {
  const student = students.find(s => s.id === id) as Student;
  if (student) showStudentModal(student);
};

(window as any).deleteStudentHandler = (id: number) => {
  deleteStudent(id);
};

(window as any).deleteLevelHandler = (id: number) => {
  deleteLevel(id);
};

(window as any).deleteScheduleHandler = (id: number) => {
  deleteSchedule(id);
};

(window as any).closeModal = closeModal;

// Utility functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Start app
init();

