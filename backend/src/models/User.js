const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Role = require('./Role');
const UserPoint = require('./UserPoint');
const UserBadge = require('./UserBadge');
const PointsHistory = require('./PointsHistory');
const Achievement = require('./Achievement');
const LearningStreak = require('./LearningStreak');
const Leaderboard = require('./Leaderboard');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_picture_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['role_id'] }
  ]
});

User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// Gamification associations
User.hasOne(UserPoint, { foreignKey: 'user_id', as: 'points' });
User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' });
User.hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });
User.hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' });
User.hasOne(LearningStreak, { foreignKey: 'user_id', as: 'streaks' });
User.hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' });

module.exports = User;
