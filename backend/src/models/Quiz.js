const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Lesson = require('./Lesson');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quiz_type: {
    type: DataTypes.ENUM('practice', 'graded', 'final'),
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  passing_score: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  },
  time_limit_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  allow_retake: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  randomize_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  show_correct_answers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shuffle_options: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  indexes: [
    { fields: ['lesson_id'] },
    { fields: ['is_published'] }
  ]
});

Quiz.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

module.exports = Quiz;
