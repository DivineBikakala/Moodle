// Configuration API
// Configuration API
// En local: VITE_API_URL=http://localhost:3001
// En prod:  VITE_API_URL=https://moodle-khl0.onrender.com
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE.replace(/\/$/, '')}/api`;

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
  status: 'draft' | 'published' | 'archived';
  isPublished?: boolean; // Pour compatibilité avec l'ancien format
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
let currentTab: 'courses' | 'students' | 'levels' | 'schedule' = 'levels';

const BUILD_TAG = 'build-' + new Date().toISOString();

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
  } catch (_error) {
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

async function register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
) {
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
  try {
    const data = await apiCall('/students');
    students = data.students;
    renderStudents();
  } catch (error: any) {
    console.error('Error loading students:', error);
    students = [];
    renderStudents();
  }
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
  try {
    const data = await apiCall('/courses');
    console.log('Courses data received:', data);
    courses = data.courses.filter((c: Course) => c.teacherId === currentUser?.id);
    renderCourses();
  } catch (error: any) {
    console.error('Error loading courses:', error);
    // Afficher quand même l'interface vide
    courses = [];
    renderCourses();
  }
}

async function createCourse(
    title: string,
    description: string,
    levelId: number | undefined,
    isPublished: boolean
) {
  await apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify({ title, description, levelId, isPublished }),
  });
  loadCourses();
}

async function updateCourse(
    id: number,
    title: string,
    description: string,
    levelId: number | undefined,
    isPublished: boolean
) {
  await apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, levelId, isPublished }),
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
  try {
    const data = await apiCall('/levels');
    levels = data.levels;
    renderLevels();
  } catch (error: any) {
    console.error('Error loading levels:', error);
    levels = [];
    renderLevels();
  }
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
  try {
    const data = await apiCall('/schedules');
    schedules = data.schedules;
    renderSchedules();
  } catch (error: any) {
    console.error('Error loading schedules:', error);
    schedules = [];
    renderSchedules();
  }
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

  document.getElementById('login-form')!.addEventListener('submit', (e) => (window as any).handleLogin?.(e));
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

  document.getElementById('register-form')!.addEventListener('submit', (e) => (window as any).handleRegister?.(e));
  document.getElementById('show-login')!.addEventListener('click', showAuthPage);
}
function showDashboard() {
  const app = document.getElementById('app')!;

  // Show build tag only when running on localhost (development)
  const isLocalhost = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '');
  const buildTagHtml = isLocalhost ? `<div style="font-size:12px; color: rgba(255,255,255,0.85); margin-right:8px;">${BUILD_TAG}</div>` : '';

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
            ${buildTagHtml}
            <button id="btn-force-reload" title="Vider le cache et recharger" class="btn btn-secondary" style="padding:6px 10px; font-size:12px; margin-right:8px;">Rafraîchir</button>
            <button id="btn-logout" class="btn-logout">Déconnexion</button>
          </div>
        </div>
      </nav>

      <div class="nav-tabs">
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
  document.getElementById('btn-force-reload')!.addEventListener('click', async () => {
    try {
      // try to clear cache storage (service workers / caches)
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch (e) { console.warn('Cache clear failed', e); }
    // also clear app-level cached items (optionally)
    // location.reload(true) not supported; use reload then fallback
    setTimeout(() => location.reload(), 200);
  });

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = (e.currentTarget as HTMLElement).dataset.tab as any;
      switchTab(tabName);
    });
  });

  loadTabContent(currentTab);
}

function switchTab(tab: typeof currentTab) {
  // Close any open modals to prevent stacking when switching views
  document.querySelectorAll('.modal').forEach(m => m.remove());

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
    case 'students':
      loadStudents();
      break;
    case 'levels':
      loadLevels();
      break;
    case 'schedule':
      loadSchedules();
      break;
    default:
      loadLevels();
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

  document.getElementById('btn-add-course')!
      .addEventListener('click', () => (window as any).showCourseModal?.());

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

  coursesList.innerHTML = courses.map(course => {
    const isPublished = course.status === 'published';
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${course.title}</h3>
          <span class="card-badge ${isPublished ? 'badge-published' : 'badge-draft'}">
            ${isPublished ? '✓ Publié' : 'Brouillon'}
          </span>
        </div>
        <p class="card-description">${course.description}</p>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" onclick="editCourse(${course.id})">✏️ Modifier</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCourseHandler(${course.id})">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
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

  studentsList.innerHTML = students
      .map(student => `
      <div class="list-item">
        <div class="list-item-content">
          <div class="list-item-title">${student.firstName} ${student.lastName}</div>
          <div class="list-item-subtitle">
            @${student.username} • ${student.email}${student.phone ? ' • ' + student.phone : ''} • 
            <span class="badge-level">${ sanitizeName((levels.find(l => l.id === (student as any).levelId) || { name: 'N/A' }).name) }</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-sm btn-primary" onclick="editStudent(${student.id})">✏️ Modifier</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudentHandler(${student.id})">🗑️ Supprimer</button>
        </div>
      </div>
    `)
      .join('');
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

  document.getElementById('btn-add-level')!
      .addEventListener('click', () => (window as any).showLevelModal?.());

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

  levelsList.innerHTML = levels.map((level, idx) => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${sanitizeName(level.name)}</h3>
        <span class="badge-level">Niveau ${idx + 1}</span>
      </div>
      <p class="card-description">${level.description || 'Pas de description'}</p>
      <div class="card-actions">
        <button class="btn btn-sm btn-primary" onclick="manageResources(${level.id})">🗂️ Gérer les ressources</button>
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
      <button id="btn-add-schedule" class="btn btn-accent">+ Nouveau</button>
    </div>
    <div id="schedules-list"></div>
  `;

  document.getElementById('btn-add-schedule')!.addEventListener('click', () => (window as any).showScheduleModal?.());

  const schedulesList = document.getElementById('schedules-list')!;

  if (!schedules || schedules.length === 0) {
    schedulesList.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours programmé</h3>
        <p>Ajoutez des cours à votre horaire</p>
      </div>
    `;
    return;
  }

  schedulesList.innerHTML = schedules.map(sch => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${sch.title}</div>
        <div class="list-item-subtitle">📅 ${sch.date ? new Date(sch.date).toLocaleDateString() : ''} • ⏰ ${sch.startTime} - ${sch.endTime} ${sch.location ? '• 📍 ' + sch.location : ''}</div>
        ${sch.description ? `<div style="margin-top:8px; font-size:13px;">${sch.description}</div>` : ''}
      </div>
      <div class="list-item-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteScheduleHandler(${sch.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}


// New: manage resources UI
// Utility to close modal by id (safely)
function closeModal(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Sanitize names that may be URL-encoded (e.g., 'Level%201')
function sanitizeName(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  try {
    // try decodeURIComponent first
    const dec = decodeURIComponent(raw);
    if (dec && dec !== raw) return dec;
  } catch (e) {
    // ignore
  }
  // fallback replacements
  return raw.replace(/%20/g, ' ').replace(/\+/g, ' ');
}

(window as any).manageResources = async function(levelId: number) {
  try {
    const token = authToken;
    const res = await fetch(`${API_URL}/levels/${levelId}` , { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      throw new Error(txt || 'Impossible de charger le niveau');
    }
    const data = await res.json();
    const level = data.level;
    let levelName = level?.name ?? `Level ${levelId}`;
    levelName = sanitizeName(levelName);
    const resources = (level && level.resources) || [];

    const container = document.getElementById('tab-content')!;
    container.innerHTML = `
      <div class="section-header">
        <div class="left">
          <button id="btn-back-levels" class="btn btn-secondary">← Retour</button>
          <div style="margin-left:12px">
            <h2 class="section-title">Ressources — ${levelName}</h2>
            <p class="section-subtitle">Gérez les ressources pour ce niveau</p>
          </div>
        </div>
        <div class="actions">
          <button id="btn-add-resource" class="btn btn-accent">+ Ajouter une ressource</button>
        </div>
      </div>
      <div id="resources-list"></div>
    `;

    document.getElementById('btn-back-levels')!.addEventListener('click', () => { switchTab('levels'); });
    document.getElementById('btn-add-resource')!.addEventListener('click', () => showAddResourceModal(levelId));

    const list = document.getElementById('resources-list')!;
    if (resources.length === 0) {
      list.innerHTML = `<div class="empty-state"><h3>Aucune ressource</h3><p>Ajoutez des ressources pour ce niveau</p></div>`;
      return;
    }

    list.innerHTML = resources.map((r: any) => `
      <div class="list-item">
        <div class="list-item-content">
          <div class="list-item-title">${r.title} ${r.isVisible ? '<span class="badge-published">(Publié)</span>' : '<span class="badge-draft">(Masqué)</span>'}</div>
          <div class="list-item-subtitle">${r.category} • ${r.fileType}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-sm" onclick="window.open('${r.fileUrl}','_blank')">⬇️ Télécharger</button>
          <button class="btn btn-sm" onclick="toggleResourceVisibility(${r.id}, ${r.isVisible})">${r.isVisible ? 'Masquer' : 'Publier'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteResource(${r.id})">🗑️ Supprimer</button>
        </div>
      </div>
    `).join('');

  } catch (e: any) {
    alert('Erreur: ' + (e.message || e));
  }
};

// show add resource modal
function showAddResourceModal(levelId: number) {
  // require login
  if (!authToken) {
    alert('Veuillez vous connecter pour ajouter une ressource.');
    return;
  }

  // Ensure no duplicate resource modal
  closeModal('resource-modal');

  const modalHTML = `
    <div class="modal" id="resource-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ajouter une ressource</h2>
          <button class="btn-close" id="resource-modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div id="modal-error" class="error-message hidden"></div>
          <form id="resource-form">
            <div class="form-group">
              <label class="form-label">Titre</label>
              <input type="text" id="resource-title" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="resource-description" class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">URL du fichier</label>
              <input type="url" id="resource-fileUrl" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Type de fichier (ex: application/pdf)</label>
              <input type="text" id="resource-fileType" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <select id="resource-category" class="form-input">
                <option value="notes">Notes</option>
                <option value="exercices">Exercices</option>
                <option value="examen">Examen</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div class="form-group">
              <label style="display:flex; align-items:center; cursor:pointer;"><input type="checkbox" id="resource-visible" checked /> &nbsp;Visible</label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="resource-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modalEl = document.getElementById('resource-modal') as HTMLElement;
  // store level id
  modalEl.setAttribute('data-level-id', String(levelId));

  // Close handlers
  const closeBtn = document.getElementById('resource-modal-close');
  const cancelBtn = document.getElementById('resource-cancel');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal('resource-modal'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('resource-modal'));

  // Submit handler (one-time to avoid stacking listeners)
  const form = document.getElementById('resource-form') as HTMLFormElement;
  const errorDiv = document.getElementById('modal-error') as HTMLElement;
  const submitHandler = async (e: Event) => {
    e.preventDefault();
    try {
      const title = (document.getElementById('resource-title') as HTMLInputElement).value.trim();
      const description = (document.getElementById('resource-description') as HTMLTextAreaElement).value.trim();
      const fileUrl = (document.getElementById('resource-fileUrl') as HTMLInputElement).value.trim();
      const fileType = (document.getElementById('resource-fileType') as HTMLInputElement).value.trim();
      const category = (document.getElementById('resource-category') as HTMLSelectElement).value;
      const isVisible = (document.getElementById('resource-visible') as HTMLInputElement).checked;
      if (!title || !fileUrl || !fileType) throw new Error('Veuillez remplir le titre, l\'URL et le type de fichier');
      const levelIdAttr = modalEl.getAttribute('data-level-id');
      const levelIdUsed = levelIdAttr ? parseInt(levelIdAttr,10) : levelId;
      const payload = { title, description, fileUrl, fileType, category, isVisible };
      const token = authToken;
      const res = await fetch(`${API_URL}/levels/${levelIdUsed}/resources`, { method: 'POST', headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}) }, body: JSON.stringify(payload) });
      const text = await res.text();
      if (!res.ok) {
        try { const json = JSON.parse(text); errorDiv.textContent = json.error || JSON.stringify(json); } catch(_) { errorDiv.textContent = text || 'Erreur création ressource'; }
        errorDiv.classList.remove('hidden');
        return;
      }
      // close modal and refresh resources list for the same level
      closeModal('resource-modal');
      await (window as any).manageResources?.(levelIdUsed);
    } catch (e:any) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = e.message || String(e);
    } finally {
      form.removeEventListener('submit', submitHandler);
    }
  };
  form.addEventListener('submit', submitHandler);
}

// toggle visibility
(window as any).toggleResourceVisibility = async function(resourceId: number, currentlyVisible: boolean) {
  try {
    const token = authToken;
    const res = await fetch(`${API_URL}/resources/${resourceId}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}) }, body: JSON.stringify({ isVisible: !currentlyVisible }) });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    // refresh current manage view by reloading levels list and reopening selected level
    loadLevels();
  } catch (e:any) { alert('Erreur: ' + (e.message||e)); }
};

(window as any).deleteResource = async function(resourceId: number) {
  if (!confirm('Supprimer la ressource ?')) return;
  try {
    const token = authToken;
    const res = await fetch(`${API_URL}/resources/${resourceId}`, { method: 'DELETE', headers: { ...(token?{Authorization:'Bearer '+token}:{}) } });
    if (!res.ok) throw new Error('Erreur suppression');
    loadLevels();
  } catch (e:any) { alert('Erreur: ' + (e.message||e)); }
};

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
            ${
      !isEdit
          ? `
            <div class="form-group">
              <label class="form-label">Mot de passe temporaire</label>
              <input type="password" id="student-password" class="form-input" required />
              <small style="color: var(--gray-500); font-size: 12px;">L'étudiant pourra le changer après connexion</small>
            </div>
            `
          : ''
  }
            <div class="form-group">
              <label class="form-label">Téléphone (optionnel)</label>
              <input type="tel" id="student-phone" class="form-input" value="${student?.phone || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Niveau</label>
              <select id="student-level" class="form-input" required>
                <option value="">Sélectionner un niveau</option>
                ${levels
      .map(
          level => `
                  <option value="${level.id}" ${ (student as any)?.levelId === level.id ? 'selected' : '' }>
                    ${sanitizeName(level.name)}
                  </option>
                `
      )
      .join('')}
              </select>
              ${
      levels.length === 0
          ? '<small style="color: var(--gray-500); font-size: 12px;">Aucun niveau créé. Allez dans l\'onglet "Niveaux" pour en créer.</small>'
          : ''
  }
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

async function handleStudentSubmit(e: Event, student?: Student) {
  e.preventDefault();
  const errorDiv = document.getElementById('modal-error')!;

  try {
    const levelValue = (document.getElementById('student-level') as HTMLSelectElement).value;

    const studentData = {
      firstName: (document.getElementById('student-firstName') as HTMLInputElement).value,
      lastName: (document.getElementById('student-lastName') as HTMLInputElement).value,
      username: (document.getElementById('student-username') as HTMLInputElement).value,
      email: (document.getElementById('student-email') as HTMLInputElement).value,
      phone: (document.getElementById('student-phone') as HTMLInputElement).value || undefined,
      levelId: levelValue ? parseInt(levelValue, 10) : undefined,
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

// If these handlers/modals were missing, define them here so TypeScript and the editor stop reporting 'Cannot find name'.
async function handleLogin(e: Event) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  try {
    const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
    const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
    await login(email, password);
  } catch (err: any) {
    if (errEl) errEl.innerHTML = `<div class="error-message">${err.message || String(err)}</div>`;
    else console.error(err);
  }
}

async function handleRegister(e: Event) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  try {
    const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
    const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
    const username = (document.getElementById('username') as HTMLInputElement)?.value || '';
    const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
    const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
    await register(email, username, password, firstName, lastName);
  } catch (err: any) {
    if (errEl) errEl.innerHTML = `<div class="error-message">${err.message || String(err)}</div>`;
    else console.error(err);
  }
}

function showCourseModal(course?: any) {
  // Prefer any richer implementation if present (internal hook), fallback to a simple prompt-based create
  try {
    if (typeof (window as any).__showCourseModalInternal === 'function') {
      return (window as any).__showCourseModalInternal(course);
    }
  } catch (_) {}
  const title = prompt('Titre du cours', course?.title || '')?.trim();
  if (!title) return;
  const description = prompt('Description', course?.description || '') || '';
  // create without level by default
  createCourse(title, description, undefined, false).catch(e => alert('Erreur création cours: ' + (e.message||e)));
}

function showLevelModal(level?: any) {
  try {
    if (typeof (window as any).__showLevelModalInternal === 'function') {
      return (window as any).__showLevelModalInternal(level);
    }
  } catch (_) {}
  const name = prompt('Nom du niveau', level?.name || '')?.trim();
  if (!name) return;
  const description = prompt('Description (optionnelle)', level?.description || '') || '';
  if (level && level.id) {
    apiCall(`/levels/${level.id}`, { method: 'PUT', body: JSON.stringify({ name, description }) }).then(loadLevels).catch(e=>alert('Erreur: '+(e.message||e)));
  } else {
    createLevel(name, description).catch(e=>alert('Erreur: '+(e.message||e)));
  }
}

function showScheduleModal(schedule?: any) {
  try {
    if (typeof (window as any).__showScheduleModalInternal === 'function') {
      return (window as any).__showScheduleModalInternal(schedule);
    }
  } catch (_) {}
  const title = prompt('Titre', schedule?.title || '')?.trim();
  if (!title) return;
  const date = prompt('Date (YYYY-MM-DD)', schedule?.date ? schedule.date.split('T')[0] : '') || '';
  const startTime = prompt('Heure début (HH:MM)', schedule?.startTime || '') || '';
  const endTime = prompt('Heure fin (HH:MM)', schedule?.endTime || '') || '';
  const payload = { title, date, startTime, endTime };
  if (schedule && schedule.id) {
    apiCall(`/schedules/${schedule.id}`, { method: 'PUT', body: JSON.stringify(payload) }).then(loadSchedules).catch(e=>alert('Erreur: '+(e.message||e)));
  } else {
    createSchedule(payload).catch(e=>alert('Erreur: '+(e.message||e)));
  }
}

// Expose functions globally for inline handlers and editor/runtime safety
;(window as any).handleLogin = handleLogin;
;(window as any).handleRegister = handleRegister;
;(window as any).showCourseModal = showCourseModal;
;(window as any).showLevelModal = showLevelModal;
;(window as any).showScheduleModal = showScheduleModal;
// manageResources already attached earlier as (window as any).manageResources
;(window as any).closeModal = closeModal;
;(window as any).sanitizeName = sanitizeName;

// Add global wrappers so inline onclick handlers in templates work
;(window as any).editStudent = async function(studentId: number) {
  try {
    const token = authToken;
    const res = await fetch(`${API_URL}/students/${studentId}`, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      throw new Error(txt || 'Impossible de charger l\'étudiant');
    }
    const data = await res.json();
    showStudentModal(data.student);
  } catch (e:any) {
    alert('Erreur: ' + (e.message || e));
  }
};

;(window as any).deleteStudentHandler = async function(studentId: number) {
  if (!confirm('Supprimer cet étudiant ?')) return;
  try {
    const token = authToken;
    const res = await fetch(`${API_URL}/students/${studentId}`, { method: 'DELETE', headers: token ? { Authorization: 'Bearer ' + token } : {} });
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      throw new Error(txt || 'Erreur suppression');
    }
    loadStudents();
  } catch (e:any) {
    alert('Erreur: ' + (e.message || e));
  }
};

init();
