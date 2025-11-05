import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle Level
interface LevelAttributes {
  id: number;
  name: string;
  description?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributs optionnels lors de la création
interface LevelCreationAttributes extends Optional<LevelAttributes, 'id'> {}

// Classe du modèle Level
class Level extends Model<LevelAttributes, LevelCreationAttributes> implements LevelAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public order!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Level.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'levels',
    timestamps: true
  }
);

export default Level;

