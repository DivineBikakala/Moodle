import sequelize from '../config/database';
import { User } from '../models';

export async function seedAdmin() {
  console.log(' Vérification du compte administrateur...\n');

  const existingAdmin = await User.findOne({
    where: { email: 'admin@moodle.com' }
  });

  if (existingAdmin) {
    console.log(' Admin déjà existant\n');
    return existingAdmin;
  }

  const admin = await User.create({
    email: 'admin@moodle.com',
    username: 'admin',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'Moodle',
    role: 'teacher',
    phone: '0000000000'
  });

  console.log(' Admin créé : admin@moodle.com | password123\n');

  return admin;
}

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log(' Connecté à PostgreSQL\n');

      await sequelize.sync();

      await seedAdmin();

      console.log('Seed admin terminé\n');
      process.exit(0);
    } catch (error) {
      console.error(' Erreur:', error);
      process.exit(1);
    }
  })();
}
