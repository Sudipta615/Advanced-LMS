const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const QuizQuestion = require('./QuizQuestion');

const QuizAnswerOption = sequelize.define('QuizAnswerOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_questions',
      key: 'id'
    }
  },
  option_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'quiz_answer_options',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['question_id'] }
  ]
});

QuizAnswerOption.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });
QuizQuestion.hasMany(QuizAnswerOption, { foreignKey: 'question_id', as: 'answerOptions' });

module.exports = QuizAnswerOption;
