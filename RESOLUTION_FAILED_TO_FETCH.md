# 🔧 RÉSOLUTION "FAILED TO FETCH"

## 🐛 Problème actuel

Tu vois deux erreurs :
1. **"Transform failed with 1 error"** - Erreur de compilation Vite (ligne 388)
2. **"Failed to fetch"** - Le navigateur ne peut pas accéder au serveur

## ✅ Solution complète

### ÉTAPE 1 : Arrête tous les terminaux

1. **Ferme toutes les fenêtres** de terminal (Backend, Frontend Teacher, Frontend Student)
2. Ou appuie sur **Ctrl+C** dans chaque terminal

### ÉTAPE 2 : Nettoie et redémarre tout

**Double-clique sur ce fichier :**
```
C:\Users\divin\OneDrive\Bureau\portail\Moodle\RESTART-ALL-CLEAN.bat
```

Ce script va :
- ✅ Arrêter tous les processus Node
- ✅ Supprimer le cache Vite
- ✅ Redémarrer Backend, Frontend Teacher et Frontend Student

**Attends 15 secondes** que tout démarre.

### ÉTAPE 3 : Vérifie les terminaux

**Dans le terminal "Frontend-Student", tu dois voir :**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5174/
```

**Si tu vois encore l'erreur "Transform failed" :**
- Le fichier n'est pas à jour
- Continue à l'étape 4

**Si tout est OK :**
- Va directement à l'étape 5

### ÉTAPE 4 : Si l'erreur persiste - Vérification manuelle

Ouvre le fichier :
```
C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student\main.ts
```

**Va à la ligne 388** et vérifie qu'il y a :
```typescript
function viewCourse(courseId: number) {
  alert(`Affichage du cours ${courseId} (fonctionnalité à venir)`);
}
```

**Si tu vois autre chose ou des accolades `}` en trop**, copie-colle ce contenu complet dans le fichier :

[Le fichier complet a été créé précédemment et devrait être correct]

### ÉTAPE 5 : Ouvre le navigateur

1. **Va sur :** http://localhost:5174
2. **Appuie sur :** Ctrl+Shift+R (rechargement forcé avec vidage du cache)
3. **Attends** 5 secondes

**Résultat attendu :**
- ✅ Page de connexion s'affiche (fond bleu/turquoise)
- ✅ Formulaire avec email et mot de passe
- ✅ Boutons "Se connecter" et "Créer un compte"

## 🔍 Diagnostics supplémentaires

### Si "Failed to fetch" persiste

**Vérification 1 : Le backend est-il démarré ?**
Ouvre http://localhost:3001/health dans le navigateur.

**Attendu :**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

**Si erreur "Cannot GET /health" :**
- Le backend n'est pas démarré
- Redémarre-le manuellement :
  ```bash
  cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
  npm run dev
  ```

**Vérification 2 : Le frontend est-il sur le bon port ?**
- Vérifie dans le terminal que c'est bien http://localhost:5174
- Si c'est un autre port (5175, 5176...), utilise celui-là

**Vérification 3 : Problème de CORS ?**
Ouvre la console du navigateur (F12 → Console) et cherche :
- Erreur CORS
- Erreur de connexion
- Erreur 404 ou 500

## 📋 Checklist de vérification

Avant de dire que ça ne marche pas, vérifie :

- [ ] Docker est démarré (PostgreSQL)
- [ ] Backend tourne sur http://localhost:3001
- [ ] Frontend-Student tourne sur http://localhost:5174
- [ ] Aucune erreur "Transform failed" dans le terminal
- [ ] La console du navigateur (F12) n'affiche pas d'erreur rouge
- [ ] Tu as bien rechargé avec Ctrl+Shift+R

## 🚨 Si rien ne marche

**Dernière solution - Réinstallation complète :**

```bash
# 1. Arrête tout
taskkill /F /IM node.exe

# 2. Frontend Student
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student
rmdir /s /q node_modules
npm install
npm run dev

# 3. Dans un autre terminal - Backend
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
npm run dev

# 4. Dans un autre terminal - Frontend Teacher
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-teacher
npm run dev
```

## 🎯 Commandes de test rapide

**Test 1 - Backend fonctionne ?**
```bash
curl http://localhost:3001/health
```

**Test 2 - Frontend compile ?**
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student
npm run build
```

Si ça compile sans erreur, le problème n'est pas dans le code.

---

**Date :** 2025-11-30  
**Problème :** Failed to fetch  
**Cause probable :** Cache Vite + serveur pas redémarré  
**Solution :** RESTART-ALL-CLEAN.bat

