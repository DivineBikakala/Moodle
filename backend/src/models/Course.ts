import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Attributs du modèle Course
interface CourseAttributes {
    id: number;
    teacherId: number;
    title: string;
    description?: string;
    levelId?: number | null;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    maxStudents?: number;
    status?: 'draft' | 'published' | 'archived';
    createdAt?: Date;
    updatedAt?: Date;
}

// Attributs optionnels lors de la création
interface CourseCreationAttributes
    extends Optional<
        CourseAttributes,
        'id' | 'description' | 'levelId' | 'category' | 'startDate' | 'endDate' | 'maxStudents' | 'status'
    > {}

// Classe du modèle Course
class Course
    extends Model<CourseAttributes, CourseCreationAttributes>
    implements CourseAttributes
{
    public id!: number;
    public teacherId!: number;
    public title!: string;
    public description?: string;
    public levelId?: number | null;
    public category?: string;
    public startDate?: Date;
    public endDate?: Date;
    public maxStudents?: number;
    public status?: 'draft' | 'published' | 'archived';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
Course.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        levelId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'levels',
                key: 'id',
            },
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        maxStudents: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 30,
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            allowNull: false,
            defaultValue: 'draft',
        },
    },
    {
        sequelize,
        tableName: 'courses',
        timestamps: true,
    }
);

export default Course;
