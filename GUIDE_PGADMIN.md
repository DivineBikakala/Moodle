# 🗄️ Visualiser la Base de Données - Guide pgAdmin

## 📊 Votre Configuration Actuelle

**Type de BDD** : PostgreSQL  
**Host** : localhost  
**Port** : 5432  
**Database** : moodle_db  
**User** : moodle_user  
**Password** : moodle_password

---

## 🚀 Solution : pgAdmin 4 (Gratuit & Officiel)

### Option 1 : Télécharger pgAdmin 4 (RECOMMANDÉ)

#### Étape 1 : Téléchargement
1. Ouvrez votre navigateur
2. Allez sur : https://www.pgadmin.org/download/pgadmin-4-windows/
3. Téléchargez **pgAdmin 4 v8.x** (version Windows)
4. Installez l'application (installation standard)

#### Étape 2 : Première Configuration
1. Lancez **pgAdmin 4**
2. Définissez un **Master Password** (mot de passe principal)
3. L'interface web s'ouvre dans votre navigateur

#### Étape 3 : Connexion à votre Base
1. **Clic droit** sur "Servers" → "Register" → "Server"
2. **Onglet General** :
   - Name: `Moodle Database`
3. **Onglet Connection** :
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `moodle_db`
   - Username: `moodle_user`
   - Password: `moodle_password`
   - ✅ Cochez "Save password"
4. Cliquez **Save**

#### Étape 4 : Explorer vos Tables
```
Servers
 └── Moodle Database
      └── Databases
           └── moodle_db
                └── Schemas
                     └── public
                          └── Tables  ← VOS TABLES ICI
                               ├── users
                               ├── courses
                               ├── levels
                               ├── enrollments
                               └── ...
```

#### Étape 5 : Voir les Données
- **Clic droit** sur une table → **View/Edit Data** → **All Rows**
- Les données s'affichent dans un tableau

---

## 🎯 Alternative : DBeaver (Multi-BDD)

Si vous voulez un outil plus universel qui supporte MySQL, PostgreSQL, etc.

### Téléchargement
1. Allez sur : https://dbeaver.io/download/
2. Téléchargez **DBeaver Community** (gratuit)
3. Installez

### Configuration
1. Lancez DBeaver
2. Cliquez sur **"Nouvelle Connexion"** (icône prise électrique)
3. Sélectionnez **PostgreSQL**
4. Entrez :
   - Host: `localhost`
   - Port: `5432`
   - Database: `moodle_db`
   - Username: `moodle_user`
   - Password: `moodle_password`
5. Testez la connexion
6. Cliquez **Finish**

---

## 📱 Option Web : Adminer (Léger & Simple)

### Installation
1. Téléchargez : https://www.adminer.org/static/download/4.8.1/adminer-4.8.1-en.php
2. Renommez en `adminer.php`
3. Placez dans un dossier accessible par un serveur web

### OU utilisez Adminer avec PHP local

Je peux créer un fichier HTML qui se connecte à votre BDD si vous avez PHP installé.

---

## 🎨 Option Intégrée : VSCode Extension

Si vous utilisez VSCode, installez l'extension **PostgreSQL** :

1. Ouvrez VSCode
2. Extensions (Ctrl+Shift+X)
3. Cherchez "PostgreSQL" par Chris Kolkman
4. Installez
5. Ajoutez une connexion :
   - Host: localhost
   - User: moodle_user
   - Password: moodle_password
   - Port: 5432
   - Database: moodle_db

---

## 🏆 MA RECOMMANDATION

### ⭐ **pgAdmin 4** - Le Meilleur pour PostgreSQL

**Avantages** :
✅ Interface officielle PostgreSQL  
✅ Gratuit et Open Source  
✅ Très complet et puissant  
✅ Visualisation graphique des relations  
✅ Éditeur SQL intégré  
✅ Export facile (CSV, JSON, etc.)  
✅ Gestion complète de la BDD  

**Inconvénient** :
❌ Un peu lourd (mais très complet)

---

## 📋 Ce que Vous Pourrez Faire

### Avec pgAdmin ou DBeaver :

1. **👀 Voir toutes vos tables** et leurs données
2. **✏️ Modifier** directement les données (attention !)
3. **🔍 Rechercher** dans les tables
4. **📊 Voir les statistiques** (nombre de lignes, etc.)
5. **🔗 Visualiser les relations** entre tables
6. **💾 Exporter** les données (CSV, JSON, SQL)
7. **📝 Exécuter** des requêtes SQL personnalisées
8. **🗑️ Supprimer** des données (attention !)
9. **➕ Insérer** de nouvelles lignes
10. **🔧 Gérer** la structure des tables

---

## 🚀 Démarrage Rapide (5 minutes)

### Option Rapide : pgAdmin

```bash
# 1. Télécharger pgAdmin
# Aller sur : https://www.pgadmin.org/download/

# 2. Installer (Next, Next, Finish)

# 3. Lancer pgAdmin 4

# 4. Créer Master Password (ex: admin123)

# 5. Ajouter serveur :
   Nom: Moodle
   Host: localhost
   Port: 5432
   User: moodle_user
   Pass: moodle_password

# 6. DONE ! Explorez vos tables
```

---

## 📸 À Quoi Ça Ressemble

### pgAdmin 4
```
┌─────────────────────────────────────────┐
│  Serveur: Moodle Database               │
├─────────────────────────────────────────┤
│  📁 Databases                            │
│    └── 📊 moodle_db                     │
│         └── 📋 Schemas                   │
│              └── 🔓 public               │
│                   └── 📑 Tables          │
│                        ├── 👤 users      │
│                        ├── 📚 courses    │
│                        ├── 📊 levels     │
│                        └── 🎓 enrollments│
└─────────────────────────────────────────┘

[Clic droit sur table] → View Data
┌─────────────────────────────────────────┐
│ id │ email          │ firstName │ role  │
├────┼────────────────┼───────────┼───────┤
│ 1  │ prof@test.com  │ Jean      │teacher│
│ 2  │ eleve@test.com │ Marie     │student│
└─────────────────────────────────────────┘
```

---

## ❓ Questions Fréquentes

### Q: PostgreSQL doit être démarré ?
**R:** OUI ! Assurez-vous que PostgreSQL tourne :
```bash
# Vérifier si PostgreSQL est démarré
services.msc
# Cherchez "postgresql" et vérifiez qu'il est "Running"
```

### Q: Mot de passe incorrect ?
**R:** Vérifiez dans le fichier `.env` :
```
DB_USER=moodle_user
DB_PASSWORD=moodle_password
```

### Q: Base de données n'existe pas ?
**R:** Lancez d'abord votre backend qui crée la BDD :
```bash
cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
npm run dev
```

### Q: Connexion refusée ?
**R:** PostgreSQL n'est pas démarré. Démarrez-le depuis les services Windows.

---

## 🎯 Résumé

**Pour voir vos tables SANS commandes terminal** :

1. **📥 Téléchargez** pgAdmin 4 (https://www.pgadmin.org/download/)
2. **⚙️ Installez** l'application
3. **🔌 Connectez-vous** avec vos identifiants :
   - Host: localhost
   - Port: 5432
   - Database: moodle_db
   - User: moodle_user
   - Pass: moodle_password
4. **👀 Explorez** vos tables visuellement !

---

## 🆘 Besoin d'Aide ?

Si vous avez des problèmes :
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants dans `.env`
3. Testez la connexion dans pgAdmin
4. Contactez-moi avec le message d'erreur

---

**Créé le 9 Décembre 2025**  
**Guide d'Installation pgAdmin pour Moodle** 🗄️

