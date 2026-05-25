import express = require('express');
import cors = require('cors');
import * as dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from './config/database';
import sequelize from './config/database';
import { initializeAssociations } from './models';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import levelRoutes from './routes/level.routes';
import courseRoutes from './routes/course.routes';
import scheduleRoutes from './routes/schedule.routes';
import resourceRoutes from './routes/resource.routes';

// Charger les variables d'environnement
try {
  dotenv.config();
} catch (e) {
  console.warn('dotenv non chargé');
}

// Initialiser les associations entre modèles
initializeAssociations();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de santé / debug
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend Moodle fonctionnel', database: 'connected' });
});

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

app.get('/', (_req, res) => {
  res.send('Backend Moodle en cours d\'exécution');
});

// ✅ Montage des routes API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api', resourceRoutes);

// Migration SQL robuste
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

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectDatabase();
    await syncDatabase(false, false);
    await runMigrations();

    app.listen(port, () => {
      console.log(`✅ Backend démarré sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

startServer();
