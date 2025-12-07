import User from './User';
import Course from './Course';
import CourseResource from './CourseResource';
import Enrollment from './Enrollment';
import Level from './Level';
import Schedule from './Schedule';


// Fonction pour initialiser toutes les associations
// Elle doit être appelée APRÈS que tous les modèles soient chargés
export const initializeAssociations = () => {
  // Un enseignant (User) peut avoir plusieurs cours (Course)
  User.hasMany(Course, {
    foreignKey: 'teacherId',
    as: 'courses'
  });

  Course.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher'
  });

  // Un cours (Course) peut avoir plusieurs ressources (CourseResource)
  Course.hasMany(CourseResource, {
    foreignKey: 'courseId',
    as: 'resources'
  });

  CourseResource.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });

  // Relation many-to-many entre User (students) et Course via Enrollment
  User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: 'studentId',
    as: 'enrolledCourses'
  });

  Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'courseId',
    as: 'students'
  });

  // Relations directes avec Enrollment pour plus de flexibilité
  User.hasMany(Enrollment, {
    foreignKey: 'studentId',
    as: 'enrollments'
  });

  Enrollment.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student'
  });

  Course.hasMany(Enrollment, {
    foreignKey: 'courseId',
    as: 'enrollments'
  });

  Enrollment.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });

  // Un niveau (Level) peut avoir plusieurs ressources (CourseResource)

  Level.hasMany(Course, {
    foreignKey: 'levelId',
    as: 'courses'
  });



  Course.belongsTo(Level, {
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
  Course,
  CourseResource,
  Enrollment,
  Level,
  Schedule
};

export default {
  User,
  Course,
  CourseResource,
  Enrollment,
  Level,
  Schedule
};
