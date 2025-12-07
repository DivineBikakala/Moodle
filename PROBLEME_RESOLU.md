# ✅ PROBLÈME RÉSOLU - Inscription Enseignant

## 🔍 Problème Identifié

L'erreur était : **"column 'username' does not exist"**

La colonne `username` était définie dans le modèle User mais n'existait pas dans la base de données PostgreSQL car la synchronisation utilisait `sync({ force: false })` qui ne modifie pas les tables existantes.

## 🛠️ Solution Appliquée

### 1. Modification de la configuration de synchronisation

**Fichier modifié :** `backend/src/config/database.ts`
- Ajout du paramètre `alter` pour permettre la modification du schéma

**Fichier modifié :** `backend/src/index.ts`
- Utilisation de `syncDatabase(false, true)` pour activer l'option `alter`
- Cette option met à jour le schéma de la base de données sans perdre les données

### 2. Redémarrage du backend
- Arrêt de tous les processus Node.js
- Redémarrage du backend pour appliquer les changements
- La base de données a été synchronisée avec succès

## 🚀 Comment Démarrer le Système

### Démarrage automatique (RECOMMANDÉ)

1. **Démarrer Docker** (si ce n'est pas déjà fait)
   ```
   cd C:\Users\divin\OneDrive\Bureau\portail\Moodle
   docker-compose up -d
   ```

2. **Démarrer le Backend**
   - Double-cliquer sur : `backend\start-backend.bat`
   - OU en ligne de commande : `cd backend && npm run dev`

3. **Démarrer le Frontend Enseignant**
   - Double-cliquer sur : `frontend-teacher\start-frontend.bat`
   - OU en ligne de commande : `cd frontend-teacher && npm run dev`

4. **Ouvrir le navigateur**
   - Frontend Enseignant : http://localhost:5173
   - API Backend : http://localhost:3001
   - Health Check : http://localhost:3001/health

### Ordre de démarrage recommandé
1. ✅ Docker (PostgreSQL)
2. ✅ Backend (API)
3. ✅ Frontend (Interface utilisateur)

## 📝 Test d'Inscription

### Via le Frontend Web
1. Ouvrir http://localhost:5173
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire :
   - Prénom
   - Nom
   - Nom d'utilisateur
   - Email
   - Mot de passe
4. Cliquer sur "S'inscrire"

### Via le Script PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File test-register-teacher.ps1
```

### Via la page HTML de test
Ouvrir : `test-inscription-direct.html`

## ✅ Vérifications

### Backend fonctionne
```
curl http://localhost:3001/health
```
Résultat attendu : `{"status":"ok","message":"Backend Moodle fonctionnel","database":"connected"}`

### Base de données accessible
```
docker ps
```
Le conteneur `moodle-postgres` doit être "Up"

### Frontend accessible
Ouvrir http://localhost:5173 dans le navigateur

## 🔧 Structure de la Base de Données (Mise à jour)

Table **users** :
- ✅ id (INTEGER, PRIMARY KEY)
- ✅ email (STRING, UNIQUE)
- ✅ username (STRING, UNIQUE) ← **AJOUTÉ**
- ✅ password (STRING, hashé avec bcrypt)
- ✅ firstName (STRING)
- ✅ lastName (STRING)
- ✅ phone (STRING, optionnel)
- ✅ role (ENUM: 'teacher', 'student')
- ✅ level (INTEGER, optionnel)
- ✅ createdAt (DATE)
- ✅ updatedAt (DATE)

## 📚 API Endpoints Disponibles

### Authentification
- POST `/api/auth/register` - Inscription
- POST `/api/auth/login` - Connexion
- GET `/api/auth/me` - Profil utilisateur (avec token)

### Cours (Teacher)
- GET `/api/courses` - Liste des cours
- POST `/api/courses` - Créer un cours
- PUT `/api/courses/:id` - Modifier un cours
- DELETE `/api/courses/:id` - Supprimer un cours

### Étudiants (Teacher)
- GET `/api/students` - Liste des étudiants
- POST `/api/students` - Créer un étudiant
- PUT `/api/students/:id` - Modifier un étudiant
- DELETE `/api/students/:id` - Supprimer un étudiant

### Niveaux (Teacher)
- GET `/api/levels` - Liste des niveaux
- POST `/api/levels` - Créer un niveau
- DELETE `/api/levels/:id` - Supprimer un niveau

### Horaires (Teacher)
- GET `/api/schedules` - Liste des horaires
- POST `/api/schedules` - Créer un horaire
- DELETE `/api/schedules/:id` - Supprimer un horaire

## 🎯 Prochaines Étapes

1. Créer un compte enseignant via l'interface
2. Se connecter avec les identifiants créés
3. Créer des cours
4. Ajouter des étudiants
5. Gérer les niveaux et horaires

## 🐛 En Cas de Problème

### Le backend ne démarre pas
1. Vérifier que Docker est lancé : `docker ps`
2. Vérifier que le port 3001 est libre : `netstat -ano | findstr :3001`
3. Redémarrer : `taskkill /F /IM node.exe` puis relancer `start-backend.bat`

### Le frontend ne démarre pas
1. Vérifier que le backend fonctionne
2. Vérifier que le port 5173 est libre : `netstat -ano | findstr :5173`
3. Relancer : `start-frontend.bat`

### Erreur de connexion à la base de données
1. Vérifier Docker : `docker-compose ps`
2. Redémarrer PostgreSQL : `docker-compose restart postgres`
3. Vérifier les logs : `docker-compose logs postgres`

---

**Date de résolution :** 8 novembre 2025
**Problème :** Colonne 'username' manquante dans la base de données
**Solution :** Synchronisation avec option `alter: true`
**Statut :** ✅ RÉSOLU

