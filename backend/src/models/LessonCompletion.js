const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');

const LessonCompletion = sequelize.define('LessonCompletion', {
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
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
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
  completed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  time_spent_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'lesson_completions',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['lesson_id'] },
    { fields: ['completed_at'] },
    { fields: ['user_id', 'lesson_id', 'enrollment_id'], unique: true }
  ]
});

LessonCompletion.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
LessonCompletion.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
LessonCompletion.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

module.exports = LessonCompletion;