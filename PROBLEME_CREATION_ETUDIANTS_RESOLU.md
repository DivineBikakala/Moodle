# PROBLÈME RÉSOLU : Création d'étudiants

## Problème identifié

Vous ne pouviez pas créer d'étudiants ni depuis le portail étudiant, ni depuis le portail professeur, avec erreur "Erreur de serveur".

## Cause du problème

Le backend requiert un champ **`username`** obligatoire lors de l'inscription, mais :
1. Le **frontend étudiant** (`frontend-student/main.ts`) n'envoyait PAS ce champ dans la requête
2. Le **formulaire d'inscription étudiant** ne contenait PAS de champ pour saisir le username

## Corrections appliquées

### ✅ Frontend Étudiant (`frontend-student/main.ts`)

**1. Ajout du champ username dans le formulaire d'inscription**
```html
<div class="form-group">
  <label class="form-label">Nom d'utilisateur</label>
  <input type="text" id="username" class="form-input" required />
</div>
```

**2. Modification de la fonction `register()`**
```typescript
// AVANT
async function register(email: string, password: string, firstName: string, lastName: string)

// APRÈS
async function register(email: string, username: string, password: string, firstName: string, lastName: string)
```
Et ajout de `username` dans le JSON envoyé au backend.

**3. Modification de `handleRegister()`**
Ajout de la récupération du champ username depuis le formulaire.

### ✅ Frontend Professeur (déjà correct)

Le frontend professeur était déjà correct - il envoie bien le username lors de la création d'étudiants via `/api/students`.

## Comment tester

### Test 1 : Création depuis le portail étudiant

1. Ouvre le navigateur à `http://localhost:5174` (frontend étudiant)
2. Clique sur "Créer un compte"
3. Remplis le formulaire :
   - Prénom : Marie
   - Nom : Dupont
   - **Nom d'utilisateur : mariedupont** (nouveau champ !)
   - Email : marie.dupont@test.com
   - Mot de passe : password123
4. Clique sur "S'inscrire"

**Résultat attendu :** ✅ Création réussie + connexion automatique

### Test 2 : Création depuis le portail professeur

1. Connecte-toi en tant que professeur à `http://localhost:5173`
2. Va dans l'onglet "Étudiants"
3. Clique sur "+ Nouvel étudiant"
4. Remplis le formulaire avec username
5. Clique sur "Créer"

**Résultat attendu :** ✅ Étudiant créé et visible dans la liste

### Test 3 : Vérification dans la base de données

```powershell
docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users WHERE role = 'student';"
```

**Résultat attendu :** Liste des étudiants créés

## Fichiers modifiés

- ✅ `frontend-student/main.ts` (3 modifications)
- ✅ `backend/src/index.ts` (changement de `force: true` à `force: false` pour persistence)

## État actuel

- ✅ Backend opérationnel sur http://localhost:3001
- ✅ PostgreSQL actif avec persistence des données
- ✅ Route `/api/auth/register` fonctionnelle avec validation du username
- ✅ Route `/api/students` (professeur) fonctionnelle
- ✅ Frontend étudiant corrigé avec champ username
- ✅ Frontend professeur déjà correct

## Actions à faire maintenant

1. **Redémarre le frontend étudiant** si nécessaire pour prendre en compte les modifications :
   ```bash
   # Arrête le serveur frontend étudiant (Ctrl+C dans le terminal)
   # Puis relance :
   cd frontend-student
   npm run dev
   ```

2. **Teste la création d'un étudiant** depuis le portail étudiant

3. **Vérifie dans la base** que l'étudiant est bien créé et persiste

## Commandes utiles

```powershell
# Lister tous les utilisateurs
docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users;"

# Lister seulement les étudiants
docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users WHERE role = 'student';"

# Compter les étudiants
docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT COUNT(*) FROM users WHERE role = 'student';"
```

---

**Date de résolution :** 2025-11-29
**Problème :** Création d'étudiants impossible (erreur serveur)
**Solution :** Ajout du champ username manquant dans le frontend étudiant
**Statut :** ✅ RÉSOLU

