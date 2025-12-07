import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'moodle_db',
  username: process.env.DB_USER || 'moodle_user',
  password: process.env.DB_PASSWORD || 'moodle_password',
  logging: false, // Mettre à true pour voir les requêtes SQL en développement
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Fonction pour tester la connexion
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès');
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', error);
    process.exit(1);
  }
};

// Fonction pour synchroniser les modèles avec la base de données
export const syncDatabase = async (force: boolean = false, alter: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter }); // force: true supprime et recrée les tables, alter: true modifie le schéma
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
};

export default sequelize;
