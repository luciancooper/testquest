import { DataTypes } from 'sequelize';
import { sequelize } from './service';

export async function defineModels() {
    // define question table
    const Question = sequelize().define('Question', {
        id: {
            type: DataTypes.STRING(13),
            primaryKey: true,
        },
        subject: {
            type: DataTypes.STRING(4),
            allowNull: false,
        },
        test: {
            type: DataTypes.STRING(7),
            allowNull: false,
        },
        question: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cluster: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('MC', 'CR'),
            allowNull: false,
        },
        credits: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, { tableName: 'questions', timestamps: false });
    // define answer table
    sequelize().define('Answer', {
        question_id: {
            type: DataTypes.STRING(13),
            references: { model: Question, key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        answer: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, { tableName: 'answers', timestamps: false });
    // Synchronize the tables
    await sequelize().sync({ alter: true });
}