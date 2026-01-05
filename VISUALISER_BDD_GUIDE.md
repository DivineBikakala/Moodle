# 🚀 Guide Rapide - Visualiser la Base de Données

## ✅ 3 Solutions Disponibles

---

## 🥇 SOLUTION 1 : Visualiseur HTML (IMMÉDIAT)

### ⚡ Le Plus Rapide - Aucune Installation !

**Fichier créé** : `visualiseur-bdd.html` (dans le dossier racine `Moodle`)

### Comment l'utiliser ?

1. **Démarrez le backend** (ouvrir un terminal cmd.exe) :

```cmd
cd /d "C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend" && npm run dev
```

2. **Ouvrez le visualiseur** :
   - Double-cliquez sur `visualiseur-bdd.html` (situé dans `Moodle/visualiseur-bdd.html`)
   - OU clic-droit → "Ouvrir avec" → Chrome/Firefox

3. **Entrez si nécessaire le token** :
   - Si certaines routes sont protégées (401/403), utilisez `/api/auth/login` pour obtenir un token puis collez-le dans le champ "Token" (format : Bearer ... ou uniquement le token — le visualiseur préfixera)

4. **Explorez vos tables** :
   - Onglets : Cours, Niveaux, Étudiants, Utilisateurs, Raw
   - Le visualiseur appelle les endpoints de l'API (ex : `/api/courses`, `/api/levels`, `/api/students`)

### Où se trouve le fichier ?
- `C:\Users\divin\OneDrive\Bureau\portail\Moodle\visualiseur-bdd.html`

### Avantages / limitations
- ✅ Aucun serveur supplémentaire à lancer
- ✅ Vue rapide et responsive des données
- ⚠️ Lecture seule (pas d'édition depuis l'interface)

---

### Ajout : script batch pratique

Un script a été ajouté : `VISUALISER-BDD.bat` (dans `Moodle/`) qui :
- lit les variables de connexion dans `backend/.env`
- propose de lancer Adminer via Docker (si Docker est installé)
- affiche les informations de connexion à utiliser dans pgAdmin/DBeaver

Exécution (double-cliquer ou depuis cmd.exe) :

```cmd
cd /d "C:\Users\divin\OneDrive\Bureau\portail\Moodle" && VISUALISER-BDD.bat
```

Que fait-il ?
- Option 1 : démarre Adminer (conteneur Docker) et ouvre `http://localhost:8080` (interface graphique pour PostgreSQL)
- Option 2 : affiche les instructions pour se connecter via pgAdmin / DBeaver

---

## 🥈 SOLUTION 2 : pgAdmin 4 (COMPLET)

### 🔧 L'Outil Professionnel pour PostgreSQL

**Téléchargement** : https://www.pgadmin.org/download/

### Avantages
- ✅ Lecture ET modification des données
- ✅ Export de données (CSV, JSON, SQL)
- ✅ Visualisation des relations
- ✅ Éditeur SQL puissant
- ✅ Statistiques et graphiques

### Configuration Rapide

1. **Télécharger et installer** pgAdmin 4

2. **Ajouter votre serveur** :
   - Clic droit sur "Servers" → "Register" → "Server"
   - **General Tab** :
     - Name: `Moodle Database`
   - **Connection Tab** :
     - Host: `localhost`
     - Port: `5432`
     - Database: `moodle_db`
     - Username: `moodle_user`
     - Password: `moodle_password`
   - ✅ Save password
   - Cliquez "Save"

3. **Explorer** :
```
Moodle Database
 └── Databases
      └── moodle_db
           └── Schemas
                └── public
                     └── Tables ← VOS TABLES
```

**Voir les données** : Clic droit sur table → View/Edit Data → All Rows

---

## 🥉 SOLUTION 3 : DBeaver (UNIVERSEL)

### 🌐 Pour Tous Types de BDD (PostgreSQL, MySQL, etc.)

**Téléchargement** : https://dbeaver.io/download/

### Avantages
- ✅ Support multi-BDD
- ✅ Interface intuitive
- ✅ Gratuit et Open Source
- ✅ Export/Import facile

### Configuration
1. Installer DBeaver
2. "Nouvelle Connexion" → PostgreSQL
3. Entrer vos identifiants (mêmes que pgAdmin)
4. Explorer !

---

## 📊 Comparaison des Solutions

| Critère | HTML Visualiseur | pgAdmin 4 | DBeaver |
|---------|------------------|-----------|---------|
| **Installation** | ❌ Aucune | ⚙️ Moyenne | ⚙️ Moyenne |
| **Vitesse** | ⚡ Instantané | 🐢 ~2 min | 🐢 ~2 min |
| **Lecture** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Modification** | ❌ Non | ✅ Oui | ✅ Oui |
| **Export** | ❌ Non | ✅ Oui | ✅ Oui |
| **Interface** | 😊 Simple | 🎨 Complète | 🎨 Moderne |
| **Recommandé pour** | Vue rapide | PostgreSQL | Multi-BDD |

---

## 🎯 Ma Recommandation

### Pour Commencer (Maintenant) :
➡️ **Utilisez `visualiseur-bdd.html`**
   - Aucune installation
   - Fonctionne immédiatement
   - Parfait pour voir vos données

### Pour Travail Avancé :
➡️ **Installez pgAdmin 4**
   - Modifier les données
   - Export/Import
   - Gestion complète

---

## 🔥 Démarrage en 30 Secondes

```cmd
REM 1. Démarrer le backend (cmd.exe)
cd /d "C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend" && npm run dev

REM 2. Ouvrir visualiseur-bdd.html (double-clic ou ouvrir dans le navigateur)

REM 3. (Optionnel) Lancer VISUALISER-BDD.bat pour Adminer via Docker
cd /d "C:\Users\divin\OneDrive\Bureau\portail\Moodle" && VISUALISER-BDD.bat
```

---

## 📋 Vos Identifiants BDD

```
Type:     PostgreSQL
Host:     localhost
Port:     5432
Database: moodle_db
User:     moodle_user
Password: moodle_password
```

**💾 Ces infos sont dans** : `backend/.env`

---

## ❓ FAQ Rapide

### Q: Le visualiseur HTML ne se connecte pas ?
**R:** Vérifiez que le backend tourne sur http://localhost:3001 (ou changez l'API base dans l'UI). Si vous utilisez un port différent, mettez-le dans le champ "API base" du visualiseur.

### Q: pgAdmin demande un Master Password ?
**R:** C'est le mot de passe pour pgAdmin lui-même (vous le définissez à la première ouverture)

### Q: "Database does not exist" ?
**R:** Lancez d'abord le backend qui crée automatiquement la base (ou vérifiez `backend/.env`)

### Q: Connexion refusée ?
**R:** PostgreSQL n'est pas démarré. Vérifiez dans les Services Windows ou que le serveur distant autorise les connexions.

---

## 🎉 Résumé

Vous avez maintenant **3 façons** de voir votre base de données sans taper de commandes :

1. **visualiseur-bdd.html** → Vue rapide (0 installation)
2. **pgAdmin 4** → Outil complet (installation recommandée)
3. **DBeaver** → Alternative universelle

**Mon conseil** : Commencez avec le visualiseur HTML pour voir vos données immédiatement, puis installez pgAdmin pour un usage quotidien.

---

**Créé le 9 Décembre 2025**  
**Guide de visualisation BDD Moodle** 🗄️
