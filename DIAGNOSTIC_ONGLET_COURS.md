# 🔧 PROBLÈME - Onglet "Cours" ne s'affiche pas

## ✅ Correction appliquée

L'interface `Course` a été mise à jour pour correspondre au backend.

---

## 🔍 DIAGNOSTIC - Vérifiez ceci :

### 1. Ouvrez la console du navigateur
**Appuyez sur F12** dans votre navigateur et allez dans l'onglet **"Console"**

### 2. Regardez s'il y a des erreurs
Vous pourriez voir des erreurs comme :
- ❌ `Failed to fetch` → Le backend n'est pas démarré
- ❌ `404 Not Found` → Route incorrecte
- ❌ `401 Unauthorized` → Problème d'authentification
- ❌ `TypeError` → Problème de code JavaScript

### 3. Vérifiez l'onglet "Network"
- Allez dans l'onglet **"Network"** (Réseau)
- Cliquez sur l'onglet **"Cours"**
- Regardez s'il y a une requête vers `/api/courses`
- Vérifiez le statut (200 = OK, 400 = erreur, 500 = erreur serveur)

---

## 🎯 CAUSES POSSIBLES

### 1. Le backend n'est pas démarré
**Solution :** Démarrez le backend
```cmd
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
npm run dev
```

### 2. Token JWT expiré
**Solution :** Déconnectez-vous et reconnectez-vous

### 3. Aucun cours créé
**Solution :** C'est normal ! Créez votre premier cours en cliquant sur "+ Nouveau cours"

### 4. Erreur JavaScript
**Solution :** Regardez la console (F12) pour voir l'erreur exacte

---

## 🧪 TEST RAPIDE

### Ouvrez la console du navigateur (F12) et tapez :

```javascript
// Vérifier si les cours se chargent
fetch('http://localhost:3001/api/courses', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(data => console.log('Cours:', data))
.catch(err => console.error('Erreur:', err));
```

**Ce que vous devriez voir :**
```json
{
  "courses": []
}
```
ou
```json
{
  "courses": [
    { "id": 1, "title": "Mon cours", ... }
  ]
}
```

---

## 🚨 SI L'ONGLET EST VIDE

### C'est probablement normal !
Si vous n'avez **aucun cours créé**, vous devriez voir :
```
Aucun cours créé
Commencez par créer votre premier cours
```

**Pour créer un cours :**
1. Cliquez sur **"+ Nouveau cours"**
2. Remplissez le formulaire
3. Cliquez sur **"Créer"**

---

## 📊 VÉRIFICATION COMPLÈTE

### Étape par étape :

1. ✅ **Backend actif** ?
   ```cmd
   netstat -ano | findstr ":3001"
   ```
   Devrait afficher `LISTENING`

2. ✅ **Frontend actif** ?
   ```cmd
   netstat -ano | findstr ":5173"
   ```
   Devrait afficher `LISTENING`

3. ✅ **Connecté en tant qu'enseignant** ?
   - Vous devez être connecté
   - Votre nom doit apparaître en haut à droite

4. ✅ **Onglet "Cours" sélectionné** ?
   - L'onglet doit être en surbrillance

5. ✅ **Aucune erreur dans la console** ?
   - F12 → Console → Pas d'erreur rouge

---

## 🎯 ACTIONS IMMÉDIATES

1. **Ouvrez F12** (console du navigateur)
2. **Cliquez sur l'onglet "Cours"**
3. **Regardez la console** - Y a-t-il des erreurs rouges ?
4. **Regardez l'onglet "Network"** - La requête vers `/api/courses` réussit-elle ?
5. **Envoyez-moi le message d'erreur** si vous en voyez un

---

**Le code a été corrigé. Rechargez la page (F5) et testez !** 🚀

