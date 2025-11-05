# Guide de démarrage du projet Moodle

## ✅ État actuel : Services démarrés

Le projet est actuellement en cours d'exécution avec les trois services suivants :

### 📍 URLs des services

- **Backend (API Express)** : http://localhost:3001
  - Endpoint de santé : http://localhost:3001/health
  
- **Frontend Teacher (Vite)** : http://localhost:5175
  - Interface pour les enseignants
  
- **Frontend Student (Vite)** : http://localhost:5176
  - Interface pour les étudiants

## 🚀 Comment démarrer le projet

### Option 1 : Script automatique (recommandé)
Exécutez le fichier `start-services.bat` à la racine du projet :
```batch
start-services.bat
```
Ce script ouvre trois fenêtres de terminal séparées qui :
1. Installent les dépendances nécessaires (npm install)
2. Démarrent chaque service en mode développement

### Option 2 : Démarrage manuel
Ouvrez trois terminaux séparés et exécutez dans chacun :

**Terminal 1 - Backend :**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend Teacher :**
```bash
cd frontend-teacher
npm install
npm run dev
```

**Terminal 3 - Frontend Student :**
```bash
cd frontend-student
npm install
npm run dev
```

## 📁 Structure du projet

```
Moodle/
├── backend/              # API Express + TypeScript
│   ├── src/
│   │   └── index.ts     # Serveur Express minimal
│   └── package.json
│
├── frontend-teacher/     # Interface enseignant (Vite)
│   ├── index.html       # Point d'entrée HTML
│   ├── main.ts          # Code TypeScript principal
│   └── package.json
│
├── frontend-student/     # Interface étudiant (Vite)
│   ├── index.html       # Point d'entrée HTML
│   ├── main.ts          # Code TypeScript principal
│   └── package.json
│
└── start-services.bat   # Script de démarrage automatique
```

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express, TypeScript, ts-node-dev
- **Frontends** : Vite, TypeScript
- **Développement** : Hot reload activé sur tous les services

## 📝 Prochaines étapes

Le projet est maintenant configuré avec une base minimale. Vous pouvez :
1. Ajouter des routes API dans `backend/src/`
2. Développer l'interface dans les frontends
3. Configurer une base de données (voir `backend/src/config/database.ts`)
4. Ajouter l'authentification (voir `backend/src/middlewares/auth.middleware.ts`)

## 🔧 Commandes utiles

- `npm run dev` - Démarrer en mode développement avec hot reload
- `npm run build` - Compiler le code TypeScript
- `npm run start` - Démarrer en mode production (après build)

## ⚠️ Notes importantes

- Les ports peuvent changer si déjà occupés (Vite trouve automatiquement un port disponible)
- Les dépendances sont installées automatiquement au premier démarrage
- Le hot reload est activé : les modifications sont visibles immédiatement

