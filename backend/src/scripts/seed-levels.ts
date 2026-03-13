import sequelize from '../config/database';
import { Level } from '../models';

export async function seedLevels() {
  console.log('📚 Création des niveaux...');

  // Vérifier si des niveaux existent déjà
  const existingLevels = await Level.count();

  if (existingLevels > 0) {
    console.log(`⚠️  ${existingLevels} niveau(x) existe(nt) déjà, skip de la création`);
    const levels = await Level.findAll({ order: [['order', 'ASC']] });
    return levels;
  }

  const levels = await Level.bulkCreate([
    {
      name: 'A0-A1',
      description: 'Niveau débutant - Découverte de la langue',
      order: 1
    },
    {
      name: 'A2-B1',
      description: 'Niveau élémentaire - Bases de la communication',
      order: 2
    },
    {
      name: 'B2-C1',
      description: 'Niveau intermédiaire - Autonomie linguistique',
      order: 3
    },
    {
      name: 'C1-C2',
      description: 'Niveau avancé - Maîtrise de la langue',
      order: 4
    }
  ]);

  console.log(`✅ ${levels.length} niveaux créés`);
  return levels;
}

// Si exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connecté à PostgreSQL\n');
      await sequelize.sync();
      await seedLevels();
      console.log('\n✅ Seed des niveaux terminé !');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}
