# 🔴 PROBLÈME: ERR_CONNECTION_REFUSED - Backend non accessible

## Diagnostic

Vous avez l'erreur: `Failed to load resource: net::ERR_CONNECTION_REFUSED` pour `http://localhost:3001/api/auth/login`

### Cause identifiée
Le backend ne peut pas démarrer à cause d'une erreur de base de données:
```
column "username" of relation "users" contains null values
```

## Solution étape par étape

### ÉTAPE 1: Vérifier Docker Desktop
1. ✅ Ouvrez Docker Desktop
2. ✅ Attendez qu'il affiche "Docker Desktop is running"
3. ✅ Dans le terminal, tapez: `docker ps`
   - Si ça affiche une erreur, Docker n'est pas lancé

### ÉTAPE 2: Nettoyer complètement
Ouvrez un terminal CMD (pas PowerShell) dans le dossier Moodle et exécutez:

```cmd
rem Arrêter tous les processus Node
taskkill /F /IM node.exe

rem Arrêter et supprimer la base de données
docker-compose down -v

rem Redémarrer PostgreSQL proprement
docker-compose up -d

rem Attendre 15 secondes
timeout /t 15

rem Démarrer le backend
cd backend
npm run dev
```

### ÉTAPE 3: Vérifier le backend
1. Le terminal du backend doit afficher:
   ```
   ✅ Connexion à PostgreSQL établie avec succès
   ✅ Base de données synchronisée
   🚀 Serveur démarré sur http://localhost:3001
   ```

2. Si vous voyez une erreur, vérifiez:
   - ❌ PostgreSQL n'est pas démarré → Retour à l'étape 1
   - ❌ Port 3001 déjà utilisé → `taskkill /F /IM node.exe`
   - ❌ Erreur de migration → `docker-compose down -v` puis recommencer

### ÉTAPE 4: Redémarrer les frontends
```cmd
rem Dans un nouveau terminal
cd frontend-teacher
npm run dev

rem Dans un autre terminal
cd frontend-student
npm run dev
```

## Scripts disponibles

### REPARATION.bat
Script automatique qui:
- Vérifie Docker
- Nettoie tout
- Redémarre proprement

**IMPORTANT**: Exécutez-le depuis CMD, pas PowerShell!
```cmd
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle
REPARATION.bat
```

### RESTART-CLEAN.bat
Alternative plus agressive qui supprime complètement les volumes Docker.

## Vérification finale

Une fois tout démarré, testez:
```cmd
curl http://localhost:3001/api/auth/health
```

Si ça retourne une erreur, le backend n'est pas démarré.
Si ça retourne du JSON, le backend fonctionne! ✅

## Commandes de diagnostic utiles

```cmd
rem Voir si PostgreSQL tourne
docker ps

rem Voir si le backend écoute sur 3001
netstat -ano | findstr :3001

rem Voir les processus Node
tasklist | findstr node.exe

rem Logs du backend (si démarré avec le script)
type backend\backend.log
```

## Pourquoi ce problème?

La base de données contenait des utilisateurs avec `username = NULL`. Quand le backend essaie de démarrer, Sequelize tente d'ajouter une contrainte `NOT NULL` sur cette colonne, ce qui échoue.

**Solution**: Supprimer les volumes Docker pour repartir d'une base vierge.

