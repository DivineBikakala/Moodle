# Projet Moodle Minimal - Plateforme de Gestion de Cours

## 📋 Description du Projet

Ce projet est une **plateforme de gestion de cours en ligne simplifiée** inspirée de Moodle, développée avec une architecture moderne full-stack TypeScript. L'application permet aux enseignants de créer et gérer des cours, et aux étudiants de s'inscrire et d'accéder au contenu pédagogique.

## 🎯 Objectifs du Projet

- Créer une plateforme éducative moderne et intuitive
- Permettre la gestion des cours par les enseignants
- Offrir un accès facile aux ressources pédagogiques pour les étudiants
- Implémenter un système d'authentification sécurisé
- Stocker les fichiers de manière fiable (AWS S3)

## 🏗️ Architecture

### Stack Technique

**Backend:**
- Node.js avec Express
- TypeScript pour la sécurité des types
- PostgreSQL pour la base de données
- AWS S3 pour le stockage de fichiers
- JWT pour l'authentification

**Frontends:**
- Vite pour le développement rapide
- TypeScript
- Deux interfaces séparées (Enseignant / Étudiant)

### Structure du Projet

```
Moodle/
├── backend/              # API REST Express
│   ├── src/
│   │   ├── index.ts                    # Point d'entrée du serveur
│   │   ├── config/                     # Configurations
│   │   │   ├── database.ts            # Configuration PostgreSQL
│   │   │   └── s3.ts                  # Configuration AWS S3
│   │   ├── middlewares/               # Middlewares Express
│   │   │   ├── auth.middleware.ts     # Vérification JWT
│   │   │   ├── error.middleware.ts    # Gestion d'erreurs
│   │   │   └── logger.middleware.ts   # Logs des requêtes
│   │   ├── models/                    # Modèles de données
│   │   │   ├── User.ts                # Utilisateurs (Enseignants/Étudiants)
│   │   │   ├── Course.ts              # Cours
│   │   │   ├── CourseResource.ts      # Ressources de cours
│   │   │   └── index.ts               # Export des modèles
│   │   ├── routes/                    # Routes API
│   │   │   └── auth.routes.ts         # Routes d'authentification
│   │   └── utils/                     # Utilitaires
│   │       └── logger.ts              # Logger Winston
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-teacher/     # Interface Enseignant
│   ├── index.html
│   ├── main.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── frontend-student/     # Interface Étudiant
│   ├── index.html
│   ├── main.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml    # Configuration Docker (PostgreSQL)
├── start-services.bat    # Script de démarrage Windows
├── stop-services.bat     # Script d'arrêt Windows
├── DEMARRAGE.md         # Guide de démarrage
├── SETUP.md             # Guide d'installation
└── README.md            # Ce fichier
```

## 👥 Fonctionnalités Principales

### Pour les Enseignants 👨‍🏫

1. **Gestion des Cours**
   - Créer de nouveaux cours
   - Modifier les informations des cours
   - Supprimer des cours
   - Gérer la visibilité des cours

2. **Gestion des Ressources**
   - Uploader des fichiers (PDF, documents, vidéos)
   - Organiser les ressources par cours
   - Modifier ou supprimer des ressources
   - Stockage sécurisé sur AWS S3

3. **Gestion des Étudiants**
   - Voir les étudiants inscrits
   - Gérer les inscriptions

### Pour les Étudiants 🎓

1. **Navigation des Cours**
   - Parcourir les cours disponibles
   - S'inscrire aux cours
   - Accéder aux cours inscrits

2. **Accès aux Ressources**
   - Visualiser toutes les ressources d'un cours
   - Télécharger les fichiers
   - Accès organisé par cours

3. **Profil Utilisateur**
   - Voir ses informations
   - Gérer ses inscriptions

## 🗄️ Modèle de Données

### Utilisateur (User)
```typescript
{
  id: number
  email: string
  password: string (hashé)
  firstName: string
  lastName: string
  role: 'teacher' | 'student'
  createdAt: Date
}
```

### Cours (Course)
```typescript
{
  id: number
  title: string
  description: string
  teacherId: number (référence User)
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Ressource de Cours (CourseResource)
```typescript
{
  id: number
  courseId: number (référence Course)
  title: string
  description: string
  fileUrl: string (URL S3)
  fileType: string
  uploadedAt: Date
}
```

### Inscription (Enrollment)
```typescript
{
  id: number
  studentId: number (référence User)
  courseId: number (référence Course)
  enrolledAt: Date
}
```

## 🔐 Sécurité

- **Authentification JWT** : Tokens sécurisés pour toutes les requêtes
- **Mots de passe hashés** : Utilisation de bcrypt
- **Validation des données** : Middleware de validation des entrées
- **CORS configuré** : Protection contre les requêtes non autorisées
- **Rôles utilisateurs** : Séparation Enseignant/Étudiant

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18 ou supérieur)
- PostgreSQL
- Compte AWS (pour S3)
- Git

### Installation

1. **Cloner le projet**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle
```

2. **Démarrer les services**
```bash
start-services.bat
```

3. **Accéder aux applications**
- Frontend Enseignant : http://localhost:5173
- Frontend Étudiant : http://localhost:5174
- API Backend : http://localhost:3001

Pour plus de détails, consultez `DEMARRAGE.md` et `SETUP.md`.

## 🌐 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Cours (Enseignant)
- `POST /api/courses` - Créer un cours
- `GET /api/courses` - Liste des cours
- `GET /api/courses/:id` - Détails d'un cours
- `PUT /api/courses/:id` - Modifier un cours
- `DELETE /api/courses/:id` - Supprimer un cours

### Ressources (Enseignant)
- `POST /api/courses/:id/resources` - Ajouter une ressource
- `GET /api/courses/:id/resources` - Liste des ressources
- `DELETE /api/resources/:id` - Supprimer une ressource

### Inscriptions (Étudiant)
- `POST /api/courses/:id/enroll` - S'inscrire à un cours
- `GET /api/my-courses` - Mes cours
- `DELETE /api/courses/:id/unenroll` - Se désinscrire

## 📦 Technologies Utilisées

### Backend
- **Express.js** - Framework web
- **TypeScript** - Typage statique
- **PostgreSQL** - Base de données
- **Sequelize** - ORM
- **JWT** - Authentification
- **Winston** - Logging
- **AWS SDK** - Intégration S3
- **bcrypt** - Hashage de mots de passe

### Frontend
- **Vite** - Build tool moderne
- **TypeScript** - Développement typé
- **Fetch API** - Requêtes HTTP

### DevOps
- **Docker** - Conteneurisation PostgreSQL
- **ts-node-dev** - Hot reload backend
- **ESLint** - Qualité de code

## 📝 État du Projet

### ✅ Complété
- Architecture de base (Backend + 2 Frontends)
- Configuration TypeScript
- Scripts de démarrage automatique
- Serveur Express fonctionnel
- Serveurs Vite avec HMR
- **PostgreSQL + Docker configuré** ⭐
- **4 Modèles Sequelize créés (User, Course, CourseResource, Enrollment)** ⭐
- **Authentification JWT complète** ⭐
- **Middlewares de sécurité (authenticate, isTeacher, isStudent)** ⭐
- **Hash des mots de passe avec bcrypt** ⭐
- **Routes CRUD complètes (Cours, Ressources, Inscriptions)** ⭐
- **Validation express-validator** ⭐
- **Upload de fichiers vers AWS S3** ⭐
- **URLs signées pour téléchargement sécurisé** ⭐
- **16 endpoints API fonctionnels** ⭐
- **Frontend Teacher complet (auth, CRUD cours, upload)** ⭐
- **Frontend Student complet (auth, inscription, téléchargement)** ⭐
- **Interface moderne et responsive** ⭐
- **Plus de 1500 lignes de code frontend** ⭐
- Documentation complète

### 🚧 Prochaines Étapes (Roadmap)

**Phase 1 : Backend Foundation (✅ COMPLÉTÉE)**
- [x] Configuration PostgreSQL avec Docker
- [x] Installation et configuration Sequelize ORM
- [x] Création des modèles de données (User, Course, CourseResource, Enrollment)
- [x] Migration de la base de données

**Phase 2 : Authentification & Sécurité (✅ COMPLÉTÉE)**
- [x] Routes d'inscription et connexion
- [x] Hashage des mots de passe avec bcrypt
- [x] Génération et validation de tokens JWT
- [x] Middleware d'authentification
- [x] Middleware de gestion des rôles (teacher/student)

**Phase 3 : API REST Complète (✅ COMPLÉTÉE)**
- [x] Routes CRUD pour les cours (enseignants)
- [x] Routes de gestion des ressources
- [x] Routes d'inscription aux cours (étudiants)
- [x] Routes de récupération des cours inscrits
- [x] Validation des données avec express-validator

**Phase 4 : Stockage de Fichiers (✅ COMPLÉTÉE)**
- [x] Configuration AWS S3
- [x] Upload de fichiers (multer + S3)
- [x] Gestion des URLs signées pour sécurité
- [x] Suppression de fichiers S3

**Phase 5 : Interfaces Utilisateur (✅ COMPLÉTÉE)**
- [x] Page de connexion/inscription commune
- [x] Dashboard enseignant (liste des cours)
- [x] Formulaire de création/édition de cours
- [x] Gestion des ressources (upload)
- [x] Dashboard étudiant (cours disponibles)
- [x] Page de détail d'un cours
- [x] Page "Mes cours" pour étudiants

**Phase 6 : Amélioration & Production (Priorité BASSE)**
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] Logger Winston complet
- [ ] Gestion d'erreurs avancée
- [ ] Variables d'environnement (.env)
- [ ] Documentation API (Swagger)
- [ ] Optimisation des performances
- [ ] Déploiement (Heroku/Vercel)

## 🤝 Contribution

Ce projet est en cours de développement. Pour contribuer :

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Tester localement
4. Créer une Pull Request

## 📄 Licence

Projet éducatif - Tous droits réservés

## 📞 Support

Pour toute question ou problème :
- Consultez `DEMARRAGE.md` pour le démarrage
- Consultez `SETUP.md` pour l'installation complète
- Vérifiez les logs des serveurs en cas d'erreur

---

**Version actuelle :** 0.1.0 (Développement)  
**Dernière mise à jour :** 4 novembre 2025

