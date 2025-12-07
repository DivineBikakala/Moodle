# ✅ PROBLÈME DE CRÉATION DE COURS - RÉSOLU

## Problème

Quand tu essayais de créer un cours, tu avais cette erreur :
```
title, description et teacherId sont requis
```

## Cause

Le backend demandait le `teacherId` dans le body de la requête, mais le frontend ne l'envoyait pas.

## Solution appliquée

✅ **Backend modifié** (`backend/src/routes/course.routes.ts`) :
- Ajout du middleware d'authentification (`authenticate` + `isTeacher`)
- Le `teacherId` est maintenant **automatiquement récupéré** depuis le token JWT
- Le prof ne peut créer/modifier/supprimer que **ses propres cours**

## Comment tester

### Étape 1 : Redémarre le backend

**Option A - Si le backend tourne dans un terminal :**
1. Va dans le terminal du backend
2. Appuie sur `Ctrl+C`
3. Relance : `npm run dev`

**Option B - Si tu utilises START-ALL.bat :**
1. Arrête tout (STOP-ALL.bat)
2. Relance tout (START-ALL.bat)

### Étape 2 : Teste la création d'un cours

1. **Connecte-toi** au portail enseignant (http://localhost:5173)
2. **Clique sur** "+ Nouveau cours"
3. **Remplis** :
   - Titre : Mathématiques
   - Description : Cours de mathématiques pour débutants
   - ☑️ Publier ce cours (coche la case si tu veux)
4. **Clique sur** "Créer"

**Résultat attendu :** ✅ Le cours est créé et apparaît dans la liste

### Étape 3 : Vérification dans la base de données (optionnel)

```powershell
docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, title, description, teacherId, isPublished FROM courses;"
```

## Changements techniques

### Avant (❌ Problématique)
```typescript
// Le frontend devait envoyer teacherId
router.post('/', async (req, res) => {
  const { title, description, teacherId, isPublished } = req.body;
  // ...
});
```

### Après (✅ Sécurisé)
```typescript
// Le teacherId est récupéré automatiquement du token
router.post('/', authenticate, isTeacher, async (req, res) => {
  const { title, description, isPublished } = req.body;
  const teacherId = req.userId!; // Depuis le JWT
  // ...
});
```

## Avantages de cette solution

✅ **Plus sécurisé** : Un prof ne peut pas créer de cours au nom d'un autre prof  
✅ **Plus simple** : Le frontend n'a plus besoin d'envoyer le teacherId  
✅ **Authentification obligatoire** : Seuls les profs connectés peuvent créer des cours  
✅ **Protection des données** : Chaque prof ne peut modifier que ses propres cours  

## Fichiers modifiés

- ✅ `backend/src/routes/course.routes.ts` - Ajout de l'authentification et sécurisation

## État actuel

| Action | Route | Auth | Sécurité |
|--------|-------|------|----------|
| Lister tous les cours | GET /api/courses | ❌ | Public |
| Voir un cours | GET /api/courses/:id | ❌ | Public |
| Créer un cours | POST /api/courses | ✅ | Teacher only |
| Modifier un cours | PUT /api/courses/:id | ✅ | Owner only |
| Supprimer un cours | DELETE /api/courses/:id | ✅ | Owner only |

---

**Date :** 2025-11-29  
**Problème :** Erreur "teacherId requis" lors de la création de cours  
**Solution :** Authentification JWT + récupération auto du teacherId  
**Statut :** ✅ RÉSOLU

**Prochaine action :** Redémarre le backend et teste la création d'un cours !

