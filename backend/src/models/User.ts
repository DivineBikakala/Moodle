import { DataTypes, Model, Optional, ModelCtor } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

// Attributs du modèle User
interface UserAttributes {
  id: number;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'teacher' | 'student';
  levelId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributs optionnels lors de la création
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// NOTE: Use define() instead of class extends Model to avoid "Class constructor Model cannot be invoked without 'new'" runtime issues
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('teacher', 'student'),
    allowNull: false,
    defaultValue: 'student'
  },
  levelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'levels', key: 'id' },
    field: 'level' // map to existing DB column named 'level' to avoid migration
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user: any) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user: any) => {
      if (user.changed && user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
}) as ModelCtor<any>;

// Attach instance method comparePassword
(User as any).prototype.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;
