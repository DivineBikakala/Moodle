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
let courses: Course[] = [];
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
    body: JSON.stringify({ email, password, firstName, lastName, role: 'teacher' }),
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

async function loadResources(courseId: number) {
  const data = await apiCall(`/courses/${courseId}/resources`);
  courseResources = data.resources;
  showResourcesModal();
}

async function uploadResource(courseId: number, file: File, title: string, description: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);

  const response = await fetch(`${API_URL}/courses/${courseId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload');
  }

  return response.json();
}

async function deleteResource(resourceId: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
    await apiCall(`/resources/${resourceId}/file`, { method: 'DELETE' });
    if (selectedCourse) {
      loadResources(selectedCourse.id);
    }
  }
}

// UI Rendering
function showAuthPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>👨‍🏫 Portail Enseignant</h1>
          <p>Connectez-vous pour gérer vos cours</p>
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
          <h1>👨‍🏫 Créer un compte</h1>
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
        <h1>👨‍🏫 Portail Enseignant</h1>
        <div class="navbar-right">
          <span class="user-info">${currentUser?.firstName} ${currentUser?.lastName}</span>
          <button id="btn-logout" class="btn-logout">Déconnexion</button>
        </div>
      </nav>
      <div class="container">
        <div class="section-header">
          <h2>Mes Cours</h2>
          <button id="btn-add-course" class="btn-add">+ Nouveau cours</button>
        </div>
        <div id="courses-list"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-logout')!.addEventListener('click', logout);
  document.getElementById('btn-add-course')!.addEventListener('click', () => showCourseModal());

  loadCourses();
}

function renderCourses() {
  const container = document.getElementById('courses-list')!;

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Aucun cours créé</h3>
        <p>Commencez par créer votre premier cours !</p>
      </div>
    `;
    return;
  }

  container.innerHTML = courses.map(course => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${course.title}</h3>
        <span class="card-badge ${course.isPublished ? 'badge-published' : 'badge-draft'}">
          ${course.isPublished ? 'Publié' : 'Brouillon'}
        </span>
      </div>
      <p class="card-description">${course.description}</p>
      <div class="card-actions">
        <button class="btn-sm btn-edit" onclick="editCourse(${course.id})">Modifier</button>
        <button class="btn-sm btn-resources" onclick="viewResources(${course.id})">Ressources</button>
        <button class="btn-sm btn-delete" onclick="deleteCourseHandler(${course.id})">Supprimer</button>
      </div>
    </div>
  `).join('');
}

function showCourseModal(course?: Course) {
  const isEdit = !!course;
  const modalHTML = `
    <div class="modal" id="course-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>${isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h2>
          <button class="btn-close" onclick="closeModal()">&times;</button>
        </div>
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
            <label>
              <input type="checkbox" id="course-published" class="form-checkbox" ${course?.isPublished ? 'checked' : ''} />
              Publier ce cours
            </label>
          </div>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('course-form')!.addEventListener('submit', (e) => handleCourseSubmit(e, course));
}

function showResourcesModal() {
  const modalHTML = `
    <div class="modal" id="resources-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ressources - ${selectedCourse?.title}</h2>
          <button class="btn-close" onclick="closeModal()">&times;</button>
        </div>
        <button id="btn-upload" class="btn btn-primary" style="margin-bottom: 20px;">+ Ajouter une ressource</button>
        <div id="resources-list"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('btn-upload')!.addEventListener('click', showUploadForm);
  renderResources();
}

function renderResources() {
  const container = document.getElementById('resources-list')!;

  if (courseResources.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune ressource</p>';
    return;
  }

  container.innerHTML = courseResources.map(resource => `
    <div class="resource-item">
      <div class="resource-info">
        <div class="resource-title">${resource.title}</div>
        <div class="resource-meta">${resource.description || 'Pas de description'} • ${resource.fileType}</div>
      </div>
      <div class="resource-actions">
        <button class="btn-sm btn-delete" onclick="deleteResourceHandler(${resource.id})">Supprimer</button>
      </div>
    </div>
  `).join('');
}

function showUploadForm() {
  const uploadHTML = `
    <div class="modal" id="upload-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Uploader une ressource</h2>
          <button class="btn-close" onclick="closeUploadModal()">&times;</button>
        </div>
        <div id="upload-error"></div>
        <form id="upload-form">
          <div class="form-group">
            <label class="form-label">Titre</label>
            <input type="text" id="resource-title" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description (optionnelle)</label>
            <textarea id="resource-description" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Fichier</label>
            <div class="file-upload" id="file-drop">
              <p>📁 Glissez un fichier ici ou cliquez pour sélectionner</p>
              <input type="file" id="file-input" class="file-input" required />
            </div>
            <div id="file-info" class="file-info" style="display: none;"></div>
          </div>
          <button type="submit" class="btn btn-primary">Uploader</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', uploadHTML);

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const fileDrop = document.getElementById('file-drop')!;

  fileDrop.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => showFileInfo(fileInput.files?.[0]));

  document.getElementById('upload-form')!.addEventListener('submit', handleUpload);
}

function showFileInfo(file?: File) {
  const fileInfo = document.getElementById('file-info')!;
  if (file) {
    fileInfo.style.display = 'block';
    fileInfo.textContent = `Fichier sélectionné : ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }
}

function closeModal() {
  document.getElementById('course-modal')?.remove();
  document.getElementById('resources-modal')?.remove();
}

function closeUploadModal() {
  document.getElementById('upload-modal')?.remove();
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
    closeModal();
  } catch (error: any) {
    errorDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

async function handleUpload(e: Event) {
  e.preventDefault();
  const title = (document.getElementById('resource-title') as HTMLInputElement).value;
  const description = (document.getElementById('resource-description') as HTMLTextAreaElement).value;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const file = fileInput.files?.[0];
  const errorDiv = document.getElementById('upload-error')!;

  if (!file || !selectedCourse) return;

  try {
    await uploadResource(selectedCourse.id, file, title, description);
    closeUploadModal();
    loadResources(selectedCourse.id);
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

(window as any).viewResources = (id: number) => {
  selectedCourse = courses.find(c => c.id === id) || null;
  if (selectedCourse) loadResources(selectedCourse.id);
};

(window as any).deleteResourceHandler = (id: number) => {
  deleteResource(id);
};

(window as any).closeModal = closeModal;
(window as any).closeUploadModal = closeUploadModal;

// Start app
init();

