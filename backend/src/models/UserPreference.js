const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const UserPreference = sequelize.define('UserPreference', {
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
  theme: {
    type: DataTypes.ENUM('light', 'dark', 'system'),
    allowNull: false,
    defaultValue: 'system'
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'en'
  },
  notifications_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  email_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  digest_frequency: {
    type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
    allowNull: false,
    defaultValue: 'immediate'
  },
  sidebar_collapsed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'UTC'
  }
}, {
  tableName: 'user_preferences',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { unique: true, fields: ['user_id'] }
  ]
});

UserPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' });

module.exports = UserPreference;
