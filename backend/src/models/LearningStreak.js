const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const LearningStreak = sequelize.define('LearningStreak', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  current_streak_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  longest_streak_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  last_activity_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  streak_started_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'learning_streaks',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['current_streak_days'] }
  ]
});

// Associations
LearningStreak.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reverse association defined in User model

module.exports = LearningStreak;
