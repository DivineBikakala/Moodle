import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle CourseResource
interface CourseResourceAttributes {
  id: number;
  courseId: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedAt?: Date;
}

// Attributs optionnels lors de la création
interface CourseResourceCreationAttributes extends Optional<CourseResourceAttributes, 'id'> {}

// Classe du modèle CourseResource
class CourseResource extends Model<CourseResourceAttributes, CourseResourceCreationAttributes> 
  implements CourseResourceAttributes {
  public id!: number;
  public courseId!: number;
  public title!: string;
  public description!: string;
  public fileUrl!: string;
  public fileType!: string;

  public readonly uploadedAt!: Date;
}

// Initialisation du modèle
CourseResource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'course_resources',
    timestamps: false
  }
);

export default CourseResource;
