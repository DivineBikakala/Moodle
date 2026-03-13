import sequelize from '../config/database';
import { seedLevels } from './seed-levels';
import { seedUsers } from './seed-users';
import { seedSchedules } from './seed-schedules';
import { seedCourses } from './seed-courses';
import { seedResources } from './seed-resources';

async function seedAll() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('SEED COMPLET DE LA BASE DE DONNÉES MOODLE');
    console.log('═══════════════════════════════════════════════════\n');

    // Connexion à la base de données
    console.log(' Connexion à PostgreSQL...');
    await sequelize.authenticate();
    console.log(' Connecté !\n');

    // Synchroniser les modèles
    console.log(' Synchronisation des modèles...');
    await sequelize.sync({ alter: true });
    console.log(' Modèles synchronisés !\n');

    // Vérifier si des données existent déjà
    const { User } = require('../models');
    const userCount = await User.count();
    
    if (userCount > 0) {
      console.log(`ATTENTION : ${userCount} utilisateur(s) existe(nt) déjà dans la base !`);
      console.log('  Ce seed va AJOUTER de nouvelles données (pas de suppression).\n');
    }

    // Exécuter les seeds dans l'ordre (respecter les dépendances)
    console.log(' Exécution des seeds...\n');
    
    // 1. Niveaux (pas de dépendances)
    const levels = await seedLevels();
    console.log('');
    
    // 2. Utilisateurs (dépend des niveaux)
    const { teachers, students } = await seedUsers();
    console.log('');
    
    // 3. Horaires (dépend des niveaux)
    const schedules = await seedSchedules();
    console.log('');
    
    // 4. Cours (dépend des niveaux et utilisateurs)
    const courses = await seedCourses();
    console.log('');
    
    // 5. Ressources (dépend des niveaux et utilisateurs)
    const resources = await seedResources();
    console.log('');

    // Résumé final
    console.log('═══════════════════════════════════════════════════');
    console.log(' SEED TERMINÉ AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(' RÉSUMÉ DES DONNÉES CRÉÉES:');
    console.log(`    ${levels.length} niveaux`);
    console.log(`    ${teachers.length} professeurs`);
    console.log(`    ${students.length} étudiants`);
    console.log(`    ${schedules.length} horaires`);
    console.log(`    ${courses.length} cours`);
    console.log(`    ${resources.length} ressources`);
    console.log('');
    
    console.log(' IDENTIFIANTS DE CONNEXION:');
    console.log('   Professeurs:');
    teachers.forEach(t => {
      console.log(`      📧 ${t.email} |  password123`);
    });
    console.log('   Étudiants:');
    students.forEach(s => {
      console.log(`       ${s.email} |  Niveau ${s.levelId} |  password123`);
    });
    console.log('');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n ERREUR LORS DU SEED:', error);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le seed
seedAll();

