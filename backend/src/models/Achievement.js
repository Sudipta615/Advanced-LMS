const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Achievement = sequelize.define('Achievement', {
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
  achievement_type: {
    type: DataTypes.ENUM(
      'first_course',
      'first_quiz_passed',
      'first_assignment',
      'first_discussion_post',
      'weekly_goal',
      'perfect_week',
      'comeback_learner'
    ),
    allowNull: false
  },
  achievement_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  unlocked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'achievements',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['achievement_type'] },
    { fields: ['unlocked_at'] }
  ]
});

// Associations
Achievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reverse association defined in User model

module.exports = Achievement;
