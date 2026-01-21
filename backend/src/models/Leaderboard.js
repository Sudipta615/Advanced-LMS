const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');

const Leaderboard = sequelize.define('Leaderboard', {
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
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  badges_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  courses_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ranking_period: {
    type: DataTypes.ENUM('all_time', 'monthly', 'weekly'),
    allowNull: false,
    defaultValue: 'all_time'
  }
}, {
  tableName: 'leaderboards',
  timestamps: true,
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['ranking_period'] },
    { fields: ['rank'] },
    { fields: ['total_points'] },
    { fields: ['user_id', 'course_id', 'ranking_period'], unique: true }
  ]
});

Leaderboard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Leaderboard.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' });
Course.hasMany(Leaderboard, { foreignKey: 'course_id', as: 'leaderboardEntries' });

module.exports = Leaderboard;
