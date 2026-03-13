import sequelize from '../config/database';
import { Resource } from '../models';

export async function seedResources() {
  console.log(' Création des ressources...');

  const resources = await Resource.bulkCreate([
    // Niveau 1 (A0-A1)
    {
      title: 'Introduction au Français',
      description: 'Guide de démarrage pour les débutants complets',
      fileType: 'application/pdf',      // ← CHANGÉ: type → fileType (avec MIME type)
      fileUrl: 'https://example.com/resources/intro-francais.pdf',
      levelId: 1,
      category: 'notes',                 // ← CHANGÉ: doit être 'notes', 'exercices', 'examen', ou 'audio'
      isVisible: true                    // ← AJOUTÉ: remplace uploadedBy
    },
    {
      title: 'Alphabet et Prononciation',
      description: 'Vidéo explicative de l\'alphabet français',
      fileType: 'video/mp4',
      fileUrl: 'https://example.com/resources/alphabet.mp4',
      levelId: 1,
      category: 'audio',                 // ← Vidéo peut être considérée comme 'audio'
      isVisible: true
    },
    {
      title: 'Vocabulaire de base - 100 mots essentiels',
      description: 'Liste des 100 premiers mots à connaître',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/100-mots.pdf',
      levelId: 1,
      category: 'notes',
      isVisible: true
    },
    {
      title: 'Exercices de prononciation',
      description: 'Exercices pratiques pour améliorer la prononciation',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/exercices-a1.pdf',
      levelId: 1,
      category: 'exercices',
      isVisible: true
    },

    // Niveau 2 (A2-B1)
    {
      title: 'Grammaire Élémentaire',
      description: 'Les temps de base : présent, passé composé, futur',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/grammaire-a2.pdf',
      levelId: 2,
      category: 'notes',
      isVisible: true
    },
    {
      title: 'Conversation du quotidien',
      description: 'Dialogues audio pour pratiquer',
      fileType: 'audio/mpeg',
      fileUrl: 'https://example.com/resources/conversations.mp3',
      levelId: 2,
      category: 'audio',
      isVisible: true
    },
    {
      title: 'Exercices de grammaire A2',
      description: 'Exercices pratiques sur les temps verbaux',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/exercices-a2.pdf',
      levelId: 2,
      category: 'exercices',
      isVisible: true
    },
    {
      title: 'Examen blanc A2',
      description: 'Test de niveau A2 complet',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/examen-a2.pdf',
      levelId: 2,
      category: 'examen',
      isVisible: true
    },

    // Niveau 3 (B2-C1)
    {
      title: 'Littérature Française Moderne',
      description: 'Extraits d\'œuvres contemporaines',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/litterature-b2.pdf',
      levelId: 3,
      category: 'notes',
      isVisible: true
    },
    {
      title: 'Débats et Discussions',
      description: 'Vidéos de débats pour améliorer la compréhension',
      fileType: 'video/mp4',
      fileUrl: 'https://example.com/resources/debats.mp4',
      levelId: 3,
      category: 'audio',
      isVisible: true
    },
    {
      title: 'Exercices de compréhension B2',
      description: 'Textes complexes avec questions',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/exercices-b2.pdf',
      levelId: 3,
      category: 'exercices',
      isVisible: true
    },
    {
      title: 'Examen blanc B2',
      description: 'Test de niveau B2 complet',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/examen-b2.pdf',
      levelId: 3,
      category: 'examen',
      isVisible: true
    },

    // Niveau 4 (C1-C2)
    {
      title: 'Français Académique',
      description: 'Rédaction de textes formels et académiques',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/academique.pdf',
      levelId: 4,
      category: 'notes',
      isVisible: true
    },
    {
      title: 'Analyse Critique',
      description: 'Méthodologie d\'analyse de textes complexes',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/analyse.pdf',
      levelId: 4,
      category: 'notes',
      isVisible: true
    },
    {
      title: 'Exercices d\'argumentation C1',
      description: 'Exercices avancés de rhétorique et argumentation',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/exercices-c1.pdf',
      levelId: 4,
      category: 'exercices',
      isVisible: true
    },
    {
      title: 'Examen blanc C1',
      description: 'Test de niveau C1 complet',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/resources/examen-c1.pdf',
      levelId: 4,
      category: 'examen',
      isVisible: false  // ← Exemple de ressource non visible
    }
  ]);

  console.log(`✅ ${resources.length} ressources créées`);
  return resources;
}

// Si exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connecté à PostgreSQL\n');
      await sequelize.sync();
      await seedResources();
      console.log('\n✅ Seed des ressources terminé !');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}
