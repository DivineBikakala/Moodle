# 🎓 Plateforme Moodle - Guide de Démarrage Rapide

## ✅ PROBLÈME D'INSCRIPTION RÉSOLU !

Le problème "column 'username' does not exist" a été **RÉSOLU** ✅

Voir le fichier [PROBLEME_RESOLU.md](./PROBLEME_RESOLU.md) pour les détails.

---

## 🚀 Démarrage Ultra-Rapide

### Option 1 : Tout en un clic (RECOMMANDÉ)

Double-cliquez sur : **`START-ALL.bat`**

Cela va :
- ✅ Démarrer Docker et PostgreSQL
- ✅ Lancer le Backend (API)
- ✅ Lancer le Frontend Enseignant
- ✅ Ouvrir le navigateur automatiquement

### Option 2 : Démarrage manuel

1. **PostgreSQL** (Base de données)
   ```bash
   docker-compose up -d
   ```

2. **Backend** (API)
   ```bash
   cd backend
   npm run dev
   ```
   OU double-cliquez sur `backend/start-backend.bat`

3. **Frontend Enseignant**
   ```bash
   cd frontend-teacher
   npm run dev
   ```
   OU double-cliquez sur `frontend-teacher/start-frontend.bat`

4. Ouvrir http://localhost:5173

---

## 🛑 Arrêter Tous les Services

Double-cliquez sur : **`STOP-ALL.bat`**

---

## 📝 Créer un Compte Enseignant

### Via l'interface web

1. Ouvrir http://localhost:5173
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire :
   - **Prénom** : Votre prénom
   - **Nom** : Votre nom
   - **Nom d'utilisateur** : Un identifiant unique (ex: jdupont)
   - **Email** : Votre email (ex: jean.dupont@teacher.com)
   - **Mot de passe** : Un mot de passe sécurisé
4. Cliquer sur **"S'inscrire"**

### Via un script de test

```powershell
powershell -ExecutionPolicy Bypass -File test-inscription-final.ps1
```

---

## 🔐 Se Connecter

1. Aller sur http://localhost:5173
2. Entrer votre **email** et **mot de passe**
3. Cliquer sur **"Se connecter"**

---

## 🎯 Fonctionnalités Disponibles

### Pour les Enseignants

#### 📖 Gestion des Cours
- Créer des cours
- Modifier des cours
- Publier/dépublier des cours
- Supprimer des cours

#### 👥 Gestion des Étudiants
- Ajouter des étudiants
- Modifier les informations
- Assigner des niveaux
- Supprimer des comptes

#### 📊 Gestion des Niveaux
- Créer des niveaux d'apprentissage
- Organiser le contenu par difficulté
- Supprimer des niveaux

#### 📅 Gestion de l'Horaire
- Programmer des cours
- Définir date, heure, et lieu
- Consulter l'emploi du temps
- Supprimer des rendez-vous

---

## 🌐 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Enseignant** | http://localhost:5173 | Interface utilisateur |
| **Backend API** | http://localhost:3001 | API REST |
| **Health Check** | http://localhost:3001/health | Vérifier si l'API fonctionne |
| **PostgreSQL** | localhost:5432 | Base de données |

---

## 📚 API REST Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil (authentifié)

### Cours
- `GET /api/courses` - Liste
- `POST /api/courses` - Créer
- `PUT /api/courses/:id` - Modifier
- `DELETE /api/courses/:id` - Supprimer

### Étudiants
- `GET /api/students` - Liste
- `POST /api/students` - Créer
- `PUT /api/students/:id` - Modifier
- `DELETE /api/students/:id` - Supprimer

### Niveaux
- `GET /api/levels` - Liste
- `POST /api/levels` - Créer
- `DELETE /api/levels/:id` - Supprimer

### Horaires
- `GET /api/schedules` - Liste
- `POST /api/schedules` - Créer
- `DELETE /api/schedules/:id` - Supprimer

---

## 🛠️ Configuration Technique

### Prérequis
- ✅ Node.js installé
- ✅ Docker Desktop installé et démarré
- ✅ npm (inclus avec Node.js)

### Technologies Utilisées
- **Backend** : Node.js, Express, TypeScript, Sequelize
- **Frontend** : Vite, TypeScript, Tailwind CSS
- **Base de données** : PostgreSQL 15
- **Authentification** : JWT (JSON Web Tokens)
- **Hachage** : bcrypt

### Variables d'Environnement
Voir `backend/.env` :
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=moodle_db`
- `DB_USER=moodle_user`
- `DB_PASSWORD=moodle_password`
- `JWT_SECRET=votre_secret_jwt_super_securise_a_changer`
- `PORT=3001`

---

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Tuer tous les processus Node.js
taskkill /F /IM node.exe

# Redémarrer
cd backend
npm run dev
```

### PostgreSQL ne démarre pas
```bash
# Redémarrer Docker Compose
docker-compose down
docker-compose up -d

# Vérifier les logs
docker-compose logs postgres
```

### Port déjà utilisé
```bash
# Vérifier le port 3001 (backend)
netstat -ano | findstr :3001

# Vérifier le port 5173 (frontend)
netstat -ano | findstr :5173

# Tuer le processus si nécessaire
taskkill /F /PID <numéro_du_processus>
```

### Erreur "username does not exist"
**✅ CE PROBLÈME EST RÉSOLU**

Si vous rencontrez cette erreur :
1. Vérifier que le backend a bien redémarré après les modifications
2. La base de données doit être synchronisée avec `alter: true`
3. Redémarrer le backend : `taskkill /F /IM node.exe` puis `npm run dev`

---

## 📂 Structure du Projet

```
Moodle/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── config/            # Configuration DB
│   │   ├── models/            # Modèles Sequelize
│   │   ├── routes/            # Routes API
│   │   ├── middlewares/       # Middlewares
│   │   └── index.ts           # Point d'entrée
│   ├── .env                   # Variables d'environnement
│   └── start-backend.bat      # Script de démarrage
│
├── frontend-teacher/           # Interface Enseignant
│   ├── src/
│   │   └── styles.css         # Styles Tailwind
│   ├── main.ts                # Code principal
│   ├── index.html             # Page HTML
│   └── start-frontend.bat     # Script de démarrage
│
├── docker-compose.yml          # Config PostgreSQL
├── START-ALL.bat              # Démarrer tout
├── STOP-ALL.bat               # Arrêter tout
├── PROBLEME_RESOLU.md         # Documentation du fix
└── README-DEMARRAGE.md        # Ce fichier
```

---

## ✅ Checklist de Démarrage

- [ ] Docker Desktop est installé et démarré
- [ ] Node.js est installé
- [ ] Les dépendances sont installées (`npm install` dans backend/ et frontend-teacher/)
- [ ] Double-cliquer sur `START-ALL.bat`
- [ ] Attendre que tout démarre (~20 secondes)
- [ ] Le navigateur s'ouvre sur http://localhost:5173
- [ ] Créer un compte enseignant
- [ ] Se connecter et commencer à utiliser la plateforme !

---

## 🎉 Félicitations !

Votre plateforme Moodle est prête à l'emploi !

Pour toute question, consultez les fichiers de documentation :
- `PROBLEME_RESOLU.md` - Résolution du bug d'inscription
- `README.md` - Documentation principale
- `SETUP.md` - Guide d'installation

**Bon enseignement ! 📚👨‍🏫**

