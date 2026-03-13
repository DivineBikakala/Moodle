import sequelize from '../config/database';
import Schedule from '../models/Schedule';
import { User } from '../models';

export async function seedSchedules() {
  console.log('📅 Création des horaires...');

  // Vérifier si des horaires existent déjà
  const existingSchedules = await Schedule.count();
  
  if (existingSchedules > 0) {
    console.log(`⚠️  ${existingSchedules} horaire(s) existe(nt) déjà, skip de la création`);
    const schedules = await Schedule.findAll();
    return schedules;
  }

  // Récupérer des professeurs pour les horaires
  const teachers = await User.findAll({ where: { role: 'teacher' }, limit: 3 });
  if (teachers.length === 0) {
    console.log('⚠️  Aucun professeur trouvé, skip des horaires');
    return [];
  }

  const teacher1Id = teachers[0].id;
  const teacher2Id = teachers.length > 1 ? teachers[1].id : teacher1Id;

  const schedules = await Schedule.bulkCreate([
    {
      teacherId: teacher1Id,
      title: 'Cours de Français - Niveau Débutant',
      description: 'Introduction à la langue française',
      date: new Date('2026-03-16'),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Salle A1'
    },

    {
      teacherId: teacher1Id,
      title: 'Grammaire Française',
      description: 'Les bases de la conjugaison',
      date: new Date('2026-03-17'),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Salle B2'
    },

    {
      teacherId: teacher2Id,
      title: 'Conversation en Français',
      description: 'Pratique orale et échanges',
      date: new Date('2026-03-18'),
      startTime: '10:00',
      endTime: '12:00',
      location: 'Salle C3'
    },

    {
      teacherId: teacher2Id,
      title: 'Vocabulaire Avancé',
      description: 'Enrichissement du vocabulaire',
      date: new Date('2026-03-19'),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Salle B1'
    },

    {
      teacherId: teacher1Id,
      title: 'Culture Francophone',
      description: 'Découverte de la culture française',
      date: new Date('2026-03-20'),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Salle A3'
    }
  ]);

  console.log(`✅ ${schedules.length} horaires créés`);
  return schedules;
}

// exécution directe
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connecté à PostgreSQL\n');

      await sequelize.sync();

      await seedSchedules();

      console.log('\n✅ Seed des horaires terminé !');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}