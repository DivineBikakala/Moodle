import express = require('express');
import cors = require('cors');
import * as dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from './config/database';
import { initializeAssociations } from './models'; // Importer la fonction d'initialisation

// Charger les variables d'environnement de façon sûre
if (typeof dotenv !== 'undefined' && typeof (dotenv as any).config === 'function') {
  (dotenv as any).config();
} else {
  try {
    // fallback require
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dd = require('dotenv');
    dd.config && dd.config();
  } catch (e) {
    console.warn('dotenv non chargé depuis index.ts ; en supposant variables d\'environnement externes');
  }
}

// Initialiser les associations entre modèles
initializeAssociations();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parser le JSON
app.use(express.urlencoded({ extended: true })); // Parser les formulaires

// Import des routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import levelRoutes from './routes/level.routes';
import scheduleRoutes from './routes/schedule.routes';
import resourceRoutes from './routes/resource.routes';

// Routes de test
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend Moodle fonctionnel',
    database: 'connected'
  });
});

app.get('/', (_req, res) => {
  res.send('Backend Moodle minimal en cours d\'exécution');
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes); // routes de gestion des étudiants
app.use('/api/levels', levelRoutes); // routes de gestion des niveaux
app.use('/api/schedules', scheduleRoutes); // routes de gestion de l'horaire
app.use('/api', resourceRoutes); // new resource endpoints under /api/levels/:id/resources and /api/resources/:id and /api/my/resources
// TODO: Ajouter d'autres routes ici
// app.use('/api/resources', resourceRoutes);
// etc.

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDatabase();

    // Synchronisation des modèles (en développement uniquement)
    // Le schéma a été mis à jour, on garde maintenant alter:false
    await syncDatabase(false, false); // Conserver le schéma et les données

    // Démarrage du serveur Express
    app.listen(port, () => {
      console.log(` Backend démarré sur http://localhost:${port}`);
      console.log(` Santé: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error(' Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
