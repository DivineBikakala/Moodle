import User from './User';
import CourseResource from './CourseResource';
import Level from './Level';
import Schedule from './Schedule';


// Fonction pour initialiser toutes les associations
// Elle doit être appelée APRÈS que tous les modèles soient chargés
export const initializeAssociations = () => {
  // Level -> Resources
  Level.hasMany(CourseResource, {
    foreignKey: 'levelId',
    as: 'resources'
  });

  CourseResource.belongsTo(Level, {
    foreignKey: 'levelId',
    as: 'level'
  });

  // User belongsTo Level (students)
  User.belongsTo(Level, {
    foreignKey: 'levelId',
    as: 'level'
  });

  // Un enseignant (User) peut avoir plusieurs horaires (Schedule)
  User.hasMany(Schedule, {
    foreignKey: 'teacherId',
    as: 'schedules'
  });

  Schedule.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher'
  });
};


// Export de tous les modèles
export {
  User,
  Level,
  Schedule,
  CourseResource as Resource
};

export default {
  User,
  Level,
  Schedule,
  Resource: CourseResource
};
