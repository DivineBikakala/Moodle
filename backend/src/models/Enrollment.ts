import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle Enrollment
interface EnrollmentAttributes {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt?: Date;
}

// Attributs optionnels lors de la création
interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id'> {}

// Classe du modèle Enrollment
class Enrollment extends Model<EnrollmentAttributes, EnrollmentCreationAttributes>
  implements EnrollmentAttributes {
  public id!: number;
  public studentId!: number;
  public courseId!: number;

  public readonly enrolledAt!: Date;
}

// Initialisation du modèle
Enrollment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'enrollments',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'courseId'] // Un étudiant ne peut s'inscrire qu'une fois par cours
      }
    ]
  }
);

export default Enrollment;

