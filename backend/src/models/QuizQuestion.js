const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Quiz = require('./Quiz');

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'quiz_questions',
  timestamps: true,
  indexes: [
    { fields: ['quiz_id'] }
  ]
});

QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });

module.exports = QuizQuestion;
