// Configuration API
const API_URL = 'http://localhost:3001/api';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: User;
}

interface Resource {
  id: number;
  courseId: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

// State management
let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem('authToken');
let availableCourses: Course[] = [];
let myCourses: Course[] = [];
let selectedCourse: Course | null = null;
let courseResources: Resource[] = [];

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

async function register(email: string, password: string, firstName: string, lastName: string) {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName, role: 'student' }),
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

async function loadAllCourses() {
  const data = await apiCall('/courses');
  availableCourses = data.courses.filter((c: Course) => c.isPublished);
  renderAvailableCourses();
}

async function loadMyCourses() {
  const data = await apiCall('/my-courses');
  myCourses = data.courses;
  renderMyCourses();
}

async function enrollCourse(courseId: number) {
  try {
    await apiCall(`/courses/${courseId}/enroll`, { method: 'POST' });
    await loadAllCourses();
    await loadMyCourses();
  } catch (error: any) {
    alert(error.message);
  }
}

async function unenrollCourse(courseId: number) {
  if (confirm('Êtes-vous sûr de vouloir vous désinscrire de ce cours ?')) {
    await apiCall(`/courses/${courseId}/unenroll`, { method: 'DELETE' });
    await loadAllCourses();
    await loadMyCourses();
  }
}

async function loadResources(courseId: number) {
  const data = await apiCall(`/courses/${courseId}/resources`);
  courseResources = data.resources;
  showResourcesModal();
}

async function downloadResource(resourceId: number) {
  try {
    const data = await apiCall(`/resources/${resourceId}/download`);
    window.open(data.downloadUrl, '_blank');
  } catch (error: any) {
    alert('Erreur lors du téléchargement : ' + error.message);
  }
}

// UI Rendering
function showAuthPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>🎓 Portail Étudiant</h1>
          <p>Connectez-vous pour accéder à vos cours</p>
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
          <h1>🎓 Créer un compte</h1>
          <p>Inscrivez-vous en tant qu'étudiant</p>
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
        <h1>🎓 Portail Étudiant</h1>
        <div class="navbar-right">
          <span class="user-info">${currentUser?.firstName} ${currentUser?.lastName}</span>
          <button id="btn-logout" class="btn-logout">Déconnexion</button>
        </div>
      </nav>
      <div class="container">
        <div class="section-header">
          <h2>Mes Cours</h2>
        </div>
        <div id="my-courses-list"></div>
        
        <div class="section-header" style="margin-top: 40px;">
          <h2>Cours Disponibles</h2>
        </div>
        <div id="available-courses-list"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-logout')!.addEventListener('click', logout);

  loadMyCourses();
  loadAllCourses();
}

function renderMyCourses() {
  const container = document.getElementById('my-courses-list')!;

  if (myCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours inscrit</h3>
        <p>Inscrivez-vous aux cours disponibles ci-dessous !</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myCourses.map(course => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${course.title}</h3>
        <span class="card-badge badge-published">Inscrit</span>
      </div>
      <p class="card-description">${course.description}</p>
      <div class="card-actions">
        <button class="btn-sm btn-resources" onclick="viewResourcesStudent(${course.id})">Voir les ressources</button>
        <button class="btn-sm btn-delete" onclick="unenrollCourseHandler(${course.id})">Se désinscrire</button>
      </div>
    </div>
  `).join('');
}

function renderAvailableCourses() {
  const container = document.getElementById('available-courses-list')!;
  const enrolledIds = new Set(myCourses.map(c => c.id));
  const coursesToShow = availableCourses.filter(c => !enrolledIds.has(c.id));

  if (coursesToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours disponible</h3>
        <p>Vous êtes inscrit à tous les cours disponibles !</p>
      </div>
    `;
    return;
  }

  container.innerHTML = coursesToShow.map(course => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${course.title}</h3>
      </div>
      <p class="card-description">${course.description}</p>
      <div class="card-actions">
        <button class="btn-sm btn-edit" onclick="enrollCourseHandler(${course.id})">S'inscrire</button>
      </div>
    </div>
  `).join('');
}

function showResourcesModal() {
  const modalHTML = `
    <div class="modal" id="resources-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ressources - ${selectedCourse?.title}</h2>
          <button class="btn-close" onclick="closeModal()">&times;</button>
        </div>
        <div id="resources-list"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  renderResources();
}

function renderResources() {
  const container = document.getElementById('resources-list')!;

  if (courseResources.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune ressource disponible</p>';
    return;
  }

  container.innerHTML = courseResources.map(resource => `
    <div class="resource-item">
      <div class="resource-info">
        <div class="resource-title">${resource.title}</div>
        <div class="resource-meta">${resource.description || 'Pas de description'} • ${resource.fileType}</div>
      </div>
      <div class="resource-actions">
        <button class="btn-sm btn-edit" onclick="downloadResourceHandler(${resource.id})">Télécharger</button>
      </div>
    </div>
  `).join('');
}

function closeModal() {
  document.getElementById('resources-modal')?.remove();
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
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const errorDiv = document.getElementById('auth-error')!;

  try {
    await register(email, password, firstName, lastName);
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

// Global functions for onclick handlers
(window as any).enrollCourseHandler = (id: number) => {
  enrollCourse(id);
};

(window as any).unenrollCourseHandler = (id: number) => {
  unenrollCourse(id);
};

(window as any).viewResourcesStudent = (id: number) => {
  selectedCourse = [...myCourses, ...availableCourses].find(c => c.id === id) || null;
  if (selectedCourse) loadResources(selectedCourse.id);
};

(window as any).downloadResourceHandler = (id: number) => {
  downloadResource(id);
};

(window as any).closeModal = closeModal;

// Start app
init();

