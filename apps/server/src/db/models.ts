import { DataTypes } from 'sequelize';
import { sequelize } from './service';

export const Question = sequelize.define('Question', {
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

export const Answer = sequelize.define('Answer', {
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