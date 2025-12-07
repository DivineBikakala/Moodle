# 🔧 PROBLÈME : Interface Étudiant Vide (Écran Rose)

## Diagnostic

**Symptôme :** L'interface étudiant affiche un écran rose vide sans texte ni formulaire.

**Cause probable :** Le serveur Vite (frontend-student) n'est pas démarré ou le JavaScript ne se charge pas.

---

## ✅ SOLUTION RAPIDE

### Étape 1 : Démarre le serveur frontend étudiant

**Option A - Fichier batch (RECOMMANDÉ) :**
```
Double-clique sur : C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student\start-frontend.bat
```

**Option B - Manuel :**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student
npm run dev
```

Attends de voir ce message :
```
  ➜  Local:   http://localhost:5174/
```

### Étape 2 : Ouvre le navigateur

Va sur : **http://localhost:5174**

**Résultat attendu :** ✅ Formulaire de connexion visible avec fond rose/violet

---

## 🧪 TESTS DE DIAGNOSTIC

### Test 1 : Vérifier si le serveur tourne

Ouvre PowerShell et exécute :
```powershell
Test-NetConnection -ComputerName localhost -Port 5174
```

**Si TcpTestSucceeded = True :** ✅ Le serveur tourne  
**Si False :** ❌ Le serveur n'est pas démarré → lance `start-frontend.bat`

### Test 2 : Page de test HTML

Ouvre dans ton navigateur :
```
C:\Users\divin\OneDrive\Bureau\portail\Moodle\test-interface-etudiant.html
```

Cette page teste :
- ✅ Si JavaScript fonctionne dans le navigateur
- ✅ Si le backend API est accessible
- ✅ Si l'authentification fonctionne
- ✅ Si la création d'étudiants fonctionne

### Test 3 : Vérifier les erreurs dans la console du navigateur

1. Ouvre http://localhost:5174
2. Appuie sur `F12` pour ouvrir les outils développeur
3. Va dans l'onglet **Console**
4. Cherche des erreurs en rouge

**Erreurs communes :**
- `Failed to fetch` → Le backend n'est pas démarré
- `Cannot read property` → Erreur JavaScript dans main.ts
- `404 Not Found` → Fichiers manquants

---

## 🔄 DÉMARRAGE COMPLET DES SERVICES

Si rien ne fonctionne, redémarre TOUS les services :

### Option 1 : Script automatique
```
Double-clique sur : C:\Users\divin\OneDrive\Bureau\portail\Moodle\START-ALL.bat
```

### Option 2 : Manuel (3 terminaux)

**Terminal 1 - PostgreSQL :**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle
docker-compose up -d
```

**Terminal 2 - Backend :**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
npm run dev
```

**Terminal 3 - Frontend Étudiant :**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student
npm run dev
```

---

## 📋 CHECKLIST DE VÉRIFICATION

- [ ] Docker Desktop est démarré
- [ ] PostgreSQL tourne (docker ps montre `moodle-postgres`)
- [ ] Backend tourne sur http://localhost:3001
- [ ] Frontend étudiant tourne sur http://localhost:5174
- [ ] Le navigateur affiche http://localhost:5174 (pas file://)
- [ ] Cache du navigateur vidé (Ctrl+Shift+R)

---

## 🛠️ SOLUTIONS AUX PROBLÈMES COURANTS

### Problème : "npm : Le terme 'npm' n'est pas reconnu"
**Solution :** Node.js n'est pas installé ou pas dans le PATH
```bash
# Vérifie l'installation :
node --version
npm --version
```

### Problème : Port 5174 déjà utilisé
**Solution :** Tue le processus qui utilise le port
```powershell
# Trouve le PID :
netstat -ano | findstr :5174

# Tue le processus (remplace PID par le numéro) :
taskkill /F /PID <PID>
```

### Problème : Écran blanc avec erreur CORS
**Solution :** Vérifie que le backend autorise CORS
- Ouvre `backend/src/index.ts`
- Vérifie que `app.use(cors());` est présent

### Problème : Modifications non prises en compte
**Solution :** Vide le cache du navigateur
```
Ctrl + Shift + R (reload forcé)
ou
Ctrl + Shift + Delete → Vider le cache
```

---

## 📊 ORDRE DE DÉMARRAGE RECOMMANDÉ

1. **PostgreSQL** (docker-compose) → Attend 5 secondes
2. **Backend** (npm run dev) → Attend "Backend démarré"
3. **Frontend Étudiant** (npm run dev) → Attend "Local: http://localhost:5174"
4. **Ouvre le navigateur** → http://localhost:5174

---

## 🎯 VÉRIFICATION FINALE

Une fois le frontend démarré, tu dois voir :

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

**Ouvre http://localhost:5174** et tu dois voir :

- ✅ Fond rose/violet (gradient)
- ✅ Carte blanche au centre
- ✅ Titre "Portail Étudiant"
- ✅ Formulaire de connexion (Email + Mot de passe)
- ✅ Bouton "Se connecter"
- ✅ Bouton "Créer un compte"

---

## 📞 SI LE PROBLÈME PERSISTE

1. Ouvre la page de test : `test-interface-etudiant.html`
2. Clique sur "Test Backend" et "Test Inscription"
3. Copie les résultats affichés
4. Ouvre la console du navigateur (F12) sur http://localhost:5174
5. Copie les erreurs affichées en rouge

Avec ces informations, on pourra identifier le problème exact.

---

**Fichiers créés pour t'aider :**
- ✅ `frontend-student/start-frontend.bat` - Démarre le frontend étudiant
- ✅ `test-interface-etudiant.html` - Page de diagnostic complète
- ✅ `INTERFACE_VIDE_SOLUTION.md` - Ce guide

**Date :** 2025-11-29  
**Problème :** Interface étudiant vide (écran rose)  
**Solution :** Démarrer le serveur Vite frontend-student

