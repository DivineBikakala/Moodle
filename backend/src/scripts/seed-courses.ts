import sequelize from '../config/database';
import { Course, User } from '../models';

export async function seedCourses() {
  console.log('📚 Création des cours...');

  // Vérifier si des cours existent déjà
  const existingCourses = await Course.count();
  
  if (existingCourses > 0) {
    console.log(`⚠️  ${existingCourses} cours existe(nt) déjà, skip de la création`);
    const courses = await Course.findAll();
    return courses;
  }

  // Récupérer le premier prof pour créer les cours
  const teacher = await User.findOne({ where: { role: 'teacher' } });
  if (!teacher) {
    console.log('⚠️  Aucun professeur trouvé, skip des cours');
    return [];
  }

  const courses = await Course.bulkCreate([
    // Niveau 1 (A0-A1)
    {
      title: 'Initiation au Français',
      description: 'Premier contact avec la langue française - alphabet, sons de base, salutations',
      levelId: 1,
      teacherId: teacher.id,  // ← CHANGÉ: createdBy → teacherId
      status: 'published',     // ← CHANGÉ: published: true → status: 'published'
      category: 'Débutant',
      maxStudents: 30
    },
    {
      title: 'Vocabulaire du quotidien',
      description: 'Apprendre les mots essentiels pour communiquer au quotidien',
      levelId: 1,
      teacherId: teacher.id,
      status: 'published',
      category: 'Débutant',
      maxStudents: 30
    },

    // Niveau 2 (A2-B1)
    {
      title: 'Grammaire Fondamentale',
      description: 'Les bases de la grammaire française : verbes, temps, pronoms',
      levelId: 2,
      teacherId: teacher.id,
      status: 'published',
      category: 'Intermédiaire',
      maxStudents: 25
    },
    {
      title: 'Conversation Pratique',
      description: 'Exercices de conversation pour situations courantes',
      levelId: 2,
      teacherId: teacher.id,
      status: 'published',
      category: 'Intermédiaire',
      maxStudents: 20
    },

    // Niveau 3 (B2-C1)
    {
      title: 'Français des Affaires',
      description: 'Vocabulaire et expressions du monde professionnel',
      levelId: 3,
      teacherId: teacher.id,
      status: 'published',
      category: 'Avancé',
      maxStudents: 20
    },
    {
      title: 'Culture et Société',
      description: 'Découverte de la culture francophone contemporaine',
      levelId: 3,
      teacherId: teacher.id,
      status: 'published',
      category: 'Avancé',
      maxStudents: 25
    },

    // Niveau 4 (C1-C2)
    {
      title: 'Littérature Française',
      description: 'Étude d\'œuvres littéraires classiques et modernes',
      levelId: 4,
      teacherId: teacher.id,
      status: 'published',
      category: 'Expert',
      maxStudents: 15
    },
    {
      title: 'Analyse et Argumentation',
      description: 'Techniques d\'analyse critique et d\'argumentation',
      levelId: 4,
      teacherId: teacher.id,
      status: 'published',
      category: 'Expert',
      maxStudents: 15
    },
    {
      title: 'Français Académique Avancé',
      description: 'Rédaction de textes académiques et scientifiques',
      levelId: 4,
      teacherId: teacher.id,
      status: 'draft',        // ← CHANGÉ: published: false → status: 'draft'
      category: 'Expert',
      maxStudents: 12
    }
  ]);

  console.log(`✅ ${courses.length} cours créés`);
  return courses;
}

// Si exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connecté à PostgreSQL\n');
      await sequelize.sync();
      await seedCourses();
      console.log('\n✅ Seed des cours terminé !');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}
