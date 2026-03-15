// Configuration API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE.replace(/\/$/, '')}/api`;


// Types
interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  level?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  levelId?: number | null;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Level {
  id: number;
  name: string;
  description?: string;
  order: number;
}
interface Resource {
  id: number;
  levelId: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: 'notes' | 'exercices' | 'examen' | 'audio';
  isVisible: boolean;
  createdAt: string;
}

// State management
let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem('authToken');
let levels: Level[] = [];
let courses: Course[] = [];
let selectedLevel: number | null = null;
let resources: Resource[] = [];

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

async function register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
) {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password, firstName, lastName, role: 'student' }),
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

async function loadLevels() {
  try {
    const data = await apiCall('/levels');
    levels = data.levels || [];
  } catch (error) {
    console.error('Erreur chargement niveaux:', error);
    levels = [];
  }
}

async function loadCourses() {
  try {
    const data = await apiCall('/courses');
    // On ne garde que les cours avec status = 'published'
    courses = (data.courses as Course[]).filter((c) => c.status === 'published');
  } catch (error) {
    console.error('Erreur chargement cours:', error);
    courses = [];
  }
}
async function loadResources() {
  try {
    const data = await apiCall('/my/resources');
    resources = data.resources || [];
  } catch (error) {
    console.error('Erreur chargement ressources:', error);
    resources = [];
  }
}


// UI Rendering
function showAuthPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1> Portail Étudiant</h1>
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
          <h1> Créer un compte</h1>
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

async function showDashboard() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <h1> Portail Étudiant</h1>
        <div class="navbar-right">
          <span class="user-info">${currentUser?.firstName} ${currentUser?.lastName}</span>
          <button id="btn-logout" class="btn-logout">Déconnexion</button>
        </div>
      </nav>
      <div class="container">
        <div id="main-content"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-logout')!.addEventListener('click', logout);

  await Promise.all([loadLevels(), loadCourses(), loadResources()]);


  showLevelsView();
}

function showLevelsView() {
  selectedLevel = null;
  const mainContent = document.getElementById('main-content')!;

  mainContent.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Mes Niveaux</h2>
      <p class="section-subtitle">Sélectionnez un niveau pour voir les cours disponibles</p>
    </div>
    <div id="levels-container"></div>
  `;

  renderLevels();
}

function renderLevels() {
  const container = document.getElementById('levels-container')!;

  const displayLevels = [

    ...levels.map((level) => ({
      id: level.id,
      name: level.name,
      description: level.description || 'Aucune description',
      order: level.order,
    })),
  ];

  container.innerHTML = `
    <div class="levels-grid">
      ${displayLevels
      .map(
          (level, index) => `
        <div class="level-card" onclick="viewLevel(${level.id})">
          <div class="level-card-header level-${index}">
         
          </div>
          <div class="level-card-body">
            <div class="level-card-title">${level.name}</div>
            <div class="level-card-description">${level.description}</div>
            <div class="level-card-stats">
              <span> ${getCoursesCountForLevel(level.id)} cours</span>
              <span>→</span>
            </div>
          </div>
        </div>
      `
      )
      .join('')}
    </div>
  `;
}

function getCoursesCountForLevel(levelId: number): number {
  return courses.filter(
      (c) => c.levelId === levelId).length;
}

function viewLevel(levelId: number) {
  selectedLevel = levelId;
  const mainContent = document.getElementById('main-content')!;

  const levelInfo = getLevelInfo(levelId);
  const levelCourses = getCoursesForLevel(levelId);
  const levelResources = getResourcesForLevel(levelId);

  mainContent.innerHTML = `
    <div class="breadcrumb">
      <span class="breadcrumb-item">
        <a href="#" onclick="showLevelsView()" class="breadcrumb-link">Niveaux</a>
      </span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item">${levelInfo.name}</span>
    </div>

    <div class="section-header">
      <h2 class="section-title">${levelInfo.name}</h2>
      <p class="section-subtitle">${levelInfo.description}</p>
    </div>

    <div id="courses-container"></div>
     <div class="section-header" style="margin-top: 48px;">
      <h2 class="section-title">📚 Ressources disponibles</h2>
      <p class="section-subtitle">Documents et supports de cours</p>
    </div>
    <div id="resources-container"></div>
  
  `;

  renderCourses(levelCourses);
  renderResources(levelResources);
}

function getLevelInfo(levelId: number) {

  const level = levels.find((l) => l.id === levelId);
  if (level) {
    return { name: level.name, description: level.description || 'Cours disponibles' };
  }

  return { name: `Niveau ${levelId}`, description: 'Cours disponibles' };
}

function getCoursesForLevel(levelId: number): Course[] {
  return courses.filter((c) => c.levelId === levelId);
}


function renderCourses(coursesToDisplay: Course[]) {
  const container = document.getElementById('courses-container')!;

  if (coursesToDisplay.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>Aucun cours disponible</h3>
        <p>Il n'y a pas encore de cours pour ce niveau.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="courses-grid">
      ${coursesToDisplay
      .map(
          (course) => `
        <div class="course-card">
          <div class="course-card-header">
            <h3 class="course-card-title">${course.title}</h3>
            <span class="course-badge ${
              course.status === 'published' ? 'published' : 'draft'
          }">
              ${course.status === 'published' ? '✓ Publié' : 'Brouillon'}
            </span>
          </div>
          <p class="course-card-description">${course.description}</p>
          ${
              course.teacher
                  ? `
            <div class="course-card-teacher">
              <span>‍</span>
              <span>${course.teacher.firstName} ${course.teacher.lastName}</span>
            </div>
          `
                  : ''
          }
          <div class="course-card-actions">
            <button class="btn-course btn-view" onclick="viewCourse(${course.id})">
               Voir le cours
            </button>
            <button class="btn-course btn-enroll" onclick="enrollCourse(${course.id})">
              ✓ S'inscrire
            </button>
          </div>
        </div>
      `
      )
      .join('')}
    </div>
  `;
}

//
function getResourcesForLevel(levelId: number): Resource[] {
  return resources.filter((r) => r.levelId === levelId && r.isVisible);
}

function renderResources(resourcesToDisplay: Resource[]) {
  const container = document.getElementById('resources-container')!;

  if (resourcesToDisplay.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>Aucune ressource disponible</h3>
        <p>Il n'y a pas encore de ressources pour ce niveau.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="resources-grid">
      ${resourcesToDisplay
      .map((resource) => {
        const icon = getResourceIcon(resource.category, resource.fileType);
        return `
            <div class="resource-card">
              <div class="resource-icon">${icon}</div>
              <div class="resource-content">
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description || 'Aucune description'}</p>
                <div class="resource-meta">
                  <span class="resource-category">${getCategoryLabel(resource.category)}</span>
                  <span class="resource-type">${getFileTypeLabel(resource.fileType)}</span>
                </div>
              </div>
              <a href="${resource.fileUrl}" target="_blank" class="btn-resource" download>
                📥 Télécharger
              </a>
            </div>
          `;
      })
      .join('')}
    </div>
  `;
}

function getResourceIcon(category: string, fileType: string): string {
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('pdf')) return '📄';

  switch (category) {
    case 'notes': return '📝';
    case 'exercices': return '✍️';
    case 'examen': return '📋';
    case 'audio': return '🎵';
    default: return '📎';
  }
}

function getCategoryLabel(category: string): string {
  const labels: any = {
    'notes': 'Notes de cours',
    'exercices': 'Exercices',
    'examen': 'Examen',
    'audio': 'Audio'
  };
  return labels[category] || category;
}

function getFileTypeLabel(fileType: string): string {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('video')) return 'Vidéo';
  if (fileType.includes('audio')) return 'Audio';
  if (fileType.includes('image')) return 'Image';
  return 'Fichier';
}


function viewCourse(courseId: number) {
  alert(`Affichage du cours ${courseId} (fonctionnalité à venir)`);
}

async function enrollCourse(courseId: number) {
  try {
    await apiCall(`/courses/${courseId}/enroll`, { method: 'POST' });
    alert('Inscription réussie !');
    await loadCourses();
    if (selectedLevel !== null) {
      viewLevel(selectedLevel);
    }
  } catch (error: any) {
    alert("Erreur lors de l'inscription : " + error.message);
  }
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

// Global functions for onclick handlers
(window as any).showLevelsView = showLevelsView;
(window as any).viewLevel = viewLevel;
(window as any).viewCourse = viewCourse;
(window as any).enrollCourse = enrollCourse;

// Start app
init();
