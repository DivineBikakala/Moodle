import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle Course
interface CourseAttributes {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributs optionnels lors de la création
interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'isPublished'> {}

// Classe du modèle Course
class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public teacherId!: number;
  public isPublished!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true
  }
);

export default Course;

