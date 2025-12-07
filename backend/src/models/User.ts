import { DataTypes, Model, Optional } from 'sequelize';
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
  level?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributs optionnels lors de la création
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Classe du modèle User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public username!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public phone?: string;
  public role!: 'teacher' | 'student';
  public level?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthode pour vérifier le mot de passe
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Méthode pour obtenir le nom complet
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Initialisation du modèle
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
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
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hook pour hasher le mot de passe avant de sauvegarder
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
