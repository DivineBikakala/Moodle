import User from './User';
import CourseResource from './CourseResource';
import Level from './Level';
import Schedule from './Schedule';
import Course from './Course';
import Enrollment from './Enrollment';


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

  // Course associations
  Course.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher'
  });

  Course.belongsTo(Level, {
    foreignKey: 'levelId',
    as: 'level'
  });

  User.hasMany(Course, {
    foreignKey: 'teacherId',
    as: 'courses'
  });

  Level.hasMany(Course, {
    foreignKey: 'levelId',
    as: 'courses'
  });

  // Enrollment associations
  Enrollment.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student'
  });

  Enrollment.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });

  User.hasMany(Enrollment, {
    foreignKey: 'studentId',
    as: 'enrollments'
  });

  Course.hasMany(Enrollment, {
    foreignKey: 'courseId',
    as: 'enrollments'
  });
};


// Export de tous les modèles
export {
  User,
  Course,        // ← AJOUTER
  Enrollment,    // ← AJOUTER
  Level,
  Schedule,
  CourseResource as Resource
};

export default {
  User,
  Course,
  Enrollment,
  Level,
  Schedule,
  Resource: CourseResource
};
