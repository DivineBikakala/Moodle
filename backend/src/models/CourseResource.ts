import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle Resource
interface ResourceAttributes {
  id: number;
  levelId: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string; // previously mimeType / fileType
  category: 'notes' | 'exercices' | 'examen' | 'audio';
  isVisible: boolean;
  createdAt?: Date;
}

// Attributs optionnels lors de la création
interface ResourceCreationAttributes extends Optional<ResourceAttributes, 'id' | 'description' | 'isVisible'> {}

// Classe du modèle Resource
class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
  public id!: number;
  public levelId!: number;
  public title!: string;
  public description?: string;
  public fileUrl!: string;
  public fileType!: string;
  public category!: 'notes' | 'exercices' | 'examen' | 'audio';
  public isVisible!: boolean;

  public readonly createdAt!: Date;
}

// Initialisation du modèle
Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'levels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('notes', 'exercices', 'examen', 'audio'),
      allowNull: false,
      defaultValue: 'notes'
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'resources',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  }
);

export default Resource;
