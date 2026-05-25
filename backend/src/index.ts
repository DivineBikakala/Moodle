import express = require('express');
import cors = require('cors');
import * as dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from './config/database';
import sequelize from './config/database';
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
import courseRoutes from './routes/course.routes';
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

// Route debug : colonnes de la table resources
app.get('/health/schema', async (_req, res) => {
  try {
    const [cols]: any = await sequelize.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'resources' AND table_schema = 'public'
       ORDER BY ordinal_position`
    );
    res.json({ table: 'resources', columns: cols });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Migration robuste de la table resources
async function runMigrations() {
  try {
    console.log('🔧 Migration resources...');
    await sequelize.query(
      `ALTER TABLE resources ADD COLUMN IF NOT EXISTS "courseId" INTEGER REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE`
    );
    await sequelize.query(`ALTER TABLE resources DROP COLUMN IF EXISTS "levelId"`);
    console.log('✅ Migration resources terminée');
  } catch (err: any) {
    console.error('⚠️ Migration resources:', err.message);
  }
}

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDatabase();

    // Synchronisation des modèles (en développement uniquement)
    // Le schéma a été mis à jour, on garde maintenant alter:false
    await syncDatabase(false, false); // Conserver le schéma et les données
    await runMigrations();

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
