const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const QuizAttempt = require('./QuizAttempt');
const QuizQuestion = require('./QuizQuestion');
const User = require('./User');

const QuizResponse = sequelize.define('QuizResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quiz_attempt_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_attempts',
      key: 'id'
    }
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_questions',
      key: 'id'
    }
  },
  user_answer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  instructor_feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  graded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'quiz_responses',
  timestamps: true,
  indexes: [
    { fields: ['quiz_attempt_id'] },
    { fields: ['question_id'] }
  ]
});

QuizResponse.belongsTo(QuizAttempt, { foreignKey: 'quiz_attempt_id', as: 'attempt' });
QuizResponse.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });
QuizResponse.belongsTo(User, { foreignKey: 'graded_by', as: 'grader' });

module.exports = QuizResponse;
