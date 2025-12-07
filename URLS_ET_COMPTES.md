# 🎓 PORTAILS MOODLE - URLS ET CONNEXION

## 🌐 URLs de l'application

### ✅ Services actuellement actifs :

| Service | URL | Statut |
|---------|-----|--------|
| 🔧 **Backend API** | http://localhost:3001 | ✅ ACTIF |
| 👨‍🏫 **Frontend Enseignant** | http://localhost:**5173** | ✅ ACTIF |
| 👨‍🎓 **Frontend Étudiant** | http://localhost:5174 | ⏳ À démarrer si besoin |

---

## ⚠️ BASE DE DONNÉES VIDE

**OUI, la base de données a été vidée pour résoudre le problème ERR_CONNECTION_REFUSED.**

### Tous les comptes ont été supprimés :
- ❌ Comptes enseignants supprimés
- ❌ Comptes étudiants supprimés
- ❌ Cours supprimés

**C'était nécessaire** car la base de données était corrompue et empêchait le backend de démarrer.

---

## 🆕 CRÉER UN NOUVEAU COMPTE ENSEIGNANT

### Option 1 : Via l'interface web (si disponible)

1. Ouvrez http://localhost:5173
2. Cherchez un lien "Inscription" ou "Créer un compte"
3. Remplissez le formulaire avec le rôle "teacher"

### Option 2 : Via l'API directement (si pas d'interface d'inscription)

**Ouvrez un terminal et exécutez :**

```powershell
$body = @{
    email = "prof@moodle.com"
    username = "prof1"
    password = "Prof123!"
    firstName = "Jean"
    lastName = "Dupont"
    role = "teacher"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Ou avec curl (dans CMD) :**

```cmd
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"prof@moodle.com\",\"username\":\"prof1\",\"password\":\"Prof123!\",\"firstName\":\"Jean\",\"lastName\":\"Dupont\",\"role\":\"teacher\"}"
```

### Option 3 : Je peux créer le compte pour vous

Si vous voulez, je peux exécuter la commande pour créer un compte enseignant immédiatement.

**Dites-moi juste :**
- Email souhaité
- Nom d'utilisateur
- Mot de passe
- Prénom
- Nom

---

## 🔑 EXEMPLE DE COMPTE DE TEST

Si vous voulez un compte de test rapide :

**Email** : `enseignant@test.com`
**Username** : `prof_test`
**Password** : `Test123!`
**Prénom** : `Prof`
**Nom** : `Test`

Je peux créer ce compte immédiatement pour vous.

---

## 🚀 DÉMARRER LE FRONTEND ÉTUDIANT (si besoin)

Si vous voulez aussi le portail étudiant :

```cmd
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student
npm run dev
```

Il sera accessible sur http://localhost:5174

---

## 📋 RÉCAPITULATIF

**URLs :**
- Portail Enseignant : http://localhost:**5173** ✅
- Portail Étudiant : http://localhost:**5174**
- API Backend : http://localhost:**3001** ✅

**Statut :**
- ✅ Backend : ACTIF
- ✅ Frontend Enseignant : ACTIF
- ✅ Base de données : VIDE (nettoyée)

**Action requise :**
- 🆕 Créer un nouveau compte enseignant
- 🆕 Créer des comptes étudiants
- 🆕 Créer des cours

---

**Voulez-vous que je crée un compte enseignant de test pour vous maintenant ?**

