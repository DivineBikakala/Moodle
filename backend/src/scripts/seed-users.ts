import sequelize from '../config/database';
import { User } from '../models';

export async function seedUsers() {
  console.log('👥 Création des utilisateurs...');

  // Vérifier si des utilisateurs existent déjà
  const existingUsers = await User.count();
  
  if (existingUsers > 0) {
    console.log(`⚠️  ${existingUsers} utilisateur(s) existe(nt) déjà, récupération des données existantes`);
    const teachers = await User.findAll({ where: { role: 'teacher' } });
    const students = await User.findAll({ where: { role: 'student' } });
    console.log(`✅ ${teachers.length} professeur(s) trouvé(s)`);
    console.log(`✅ ${students.length} étudiant(s) trouvé(s)`);
    return { teachers, students };
  }

  // PROFESSEURS
  const teachers = await User.bulkCreate([
    {
      email: 'prof1@moodle.com',
      username: 'prof1',
      password: 'password123',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'teacher',
      phone: '0612345678'
    },
    {
      email: 'prof2@moodle.com',
      username: 'prof2',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'teacher',
      phone: '0623456789'
    }
  ] , {
    individualHooks: true  // ← AJOUTER CETTE OPTION
  });
  console.log(`${teachers.length} professeur(s) créé(s)`);

  // ÉTUDIANTS
  const students = await User.bulkCreate([
    // Niveau 1 (A0-A1)
    {
      email: 'alice.dupont@moodle.com',
      username: 'alice.dupont',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Dupont',
      role: 'student',
      levelId: 1,
      phone: '0634567890'
    },

    {
      email: 'bob.durand@moodle.com',
      username: 'bob.durand',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Durand',
      role: 'student',
      levelId: 1
    },
    // Niveau 2 (A2-B1)
    {
      email: 'claire.bernard@moodle.com',
      username: 'claire.bernard',
      password: 'password123',
      firstName: 'Claire',
      lastName: 'Bernard',
      role: 'student',
      levelId: 2
    },
    {
      email: 'david.petit@moodle.com',
      username: 'david.petit',
      password: 'password123',
      firstName: 'David',
      lastName: 'Petit',
      role: 'student',
      levelId: 2
    },
    // Niveau 3 (B2-C1)
    {
      email: 'emma.robert@moodle.com',
      username: 'emma.robert',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Robert',
      role: 'student',
      levelId: 3
    },
    {
      email: 'francois.richard@moodle.com',
      username: 'francois.richard',
      password: 'password123',
      firstName: 'François',
      lastName: 'Richard',
      role: 'student',
      levelId: 3
    },
    // Niveau 4 (C1-C2)
    {
      email: 'sophie.moreau@moodle.com',
      username: 'sophie.moreau',
      password: 'password123',
      firstName: 'Sophie',
      lastName: 'Moreau',
      role: 'student',
      levelId: 4
    },
    {
      email: 'thomas.simon@moodle.com',
      username: 'thomas.simon',
      password: 'password123',
      firstName: 'Thomas',
      lastName: 'Simon',
      role: 'student',
      levelId: 4
    }
  ],
  {
    individualHooks: true  // ← AJOUTER CETTE OPTION ICI AUSSI
  });
  console.log(` ${students.length} étudiant(s) créé(s)`);

  return { teachers, students };
}

// Si exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connecté à PostgreSQL\n');
      await sequelize.sync();
      const { teachers, students } = await seedUsers();
      
      console.log('\n═══════════════════════════════════════════════════');
      console.log('📊 RÉSUMÉ');
      console.log('═══════════════════════════════════════════════════\n');
      console.log('👨‍🏫 PROFESSEURS:');
      teachers.forEach(t => console.log(`   📧 ${t.email} | 🔑 password123`));
      console.log('\n👨‍🎓 ÉTUDIANTS:');
      students.forEach(s => console.log(`   📧 ${s.email} | 📚 Niveau ${s.levelId} | 🔑 password123`));
      console.log('\n═══════════════════════════════════════════════════');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}

