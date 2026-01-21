const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');

const Enrollment = sequelize.define('Enrollment', {
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
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completion_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped'),
    defaultValue: 'active'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  certificate_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['user_id', 'course_id'], unique: true }
  ]
});

Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });

module.exports = Enrollment;