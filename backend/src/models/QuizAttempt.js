const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Quiz = require('./Quiz');
const Enrollment = require('./Enrollment');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  time_spent_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'submitted', 'graded'),
    defaultValue: 'in_progress'
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['quiz_id'] },
    { fields: ['enrollment_id'] },
    { fields: ['status'] }
  ]
});

QuizAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizAttempt.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

module.exports = QuizAttempt;
