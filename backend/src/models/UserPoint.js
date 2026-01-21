const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const PointsHistory = require('./PointsHistory');

const UserPoint = sequelize.define('UserPoint', {
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
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  course_completion_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  quiz_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  assignment_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  discussion_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  streak_bonus_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  points_history_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  last_points_update: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_points',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['total_points'] }
  ]
});

// Associations
UserPoint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserPoint.hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });

// Reverse association defined in User model

module.exports = UserPoint;
