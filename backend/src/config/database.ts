import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

// Charger les variables d'environnement (.env en local, Environment Vars sur Render)
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

/**
 * En PRODUCTION (Render) :
 * - Utilise DATABASE_URL (Internal Database URL)
 * - Active SSL (obligatoire sur Render Postgres)
 *
 * En LOCAL :
 * - Utilise DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * - Compatible avec docker-compose
 */
const sequelize = isProduction && process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
    : new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "moodle_db",
      username: process.env.DB_USER || "moodle_user",
      password: process.env.DB_PASSWORD || "moodle_password",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

/**
 * Tester la connexion à la base de données
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à PostgreSQL établie avec succès");
  } catch (error) {
    console.error("❌ Impossible de se connecter à PostgreSQL :", error);
    process.exit(1);
  }
};

/**
 * Synchroniser les modèles Sequelize avec la base de données
 * ⚠️ Ne pas utiliser force=true en production
 */
export const syncDatabase = async (
    force: boolean = false,
    alter: boolean = false
): Promise<void> => {
  try {
    await sequelize.sync({ force, alter });
    console.log("✅ Base de données synchronisée");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation :", error);
  }
};

export default sequelize;
