import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from './config/database';
import './models'; // Importer les modèles et leurs relations

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parser le JSON
app.use(express.urlencoded({ extended: true })); // Parser les formulaires

// Import des routes
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import { resourceRoutes } from './routes/resource.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import { uploadRoutes } from './routes/upload.routes';
import studentRoutes from './routes/student.routes';
import levelRoutes from './routes/level.routes';
import scheduleRoutes from './routes/schedule.routes';

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
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes); // routes de gestion des étudiants
app.use('/api/levels', levelRoutes); // routes de gestion des niveaux
app.use('/api/schedules', scheduleRoutes); // routes de gestion de l'horaire
// TODO: Ajouter d'autres routes ici
// app.use('/api/resources', resourceRoutes);
// etc.

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDatabase();

    // Synchronisation des modèles (en développement uniquement)
    // ATTENTION: Ne pas utiliser force: true en production !
    await syncDatabase(false); // false = ne pas supprimer les tables existantes

    // Démarrage du serveur Express
    app.listen(port, () => {
      console.log(`🚀 Backend démarré sur http://localhost:${port}`);
      console.log(`📊 Santé: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
