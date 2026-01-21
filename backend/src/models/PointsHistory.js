const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PointsHistory = sequelize.define('PointsHistory', {
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
  points_earned: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  activity_type: {
    type: DataTypes.ENUM(
      'quiz_completed',
      'assignment_submitted',
      'course_completed',
      'discussion_participated',
      'lesson_completed',
      'badge_earned',
      'streak_bonus',
      'daily_login'
    ),
    allowNull: false
  },
  resource_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resource_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0
  },
  description: {
  type: DataTypes.TEXT,
  allowNull: true
  }
  }, {
  tableName: 'points_history',
  timestamps: true,
  updatedAt: false,
  indexes: [
  { fields: ['user_id'] },
  { fields: ['created_at'] },
  { fields: ['activity_type'] }
  ]
  });

// Associations are defined in User model

module.exports = PointsHistory;
