const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const ContentModeration = sequelize.define('ContentModeration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  resource_type: {
    type: DataTypes.ENUM('discussion_comment', 'announcement', 'user_profile', 'course'),
    allowNull: false
  },
  resource_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reported_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  moderation_type: {
    type: DataTypes.ENUM('report', 'flag', 'auto_filter'),
    allowNull: false,
    defaultValue: 'report'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'removed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  moderator_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  moderator_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  action_taken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'content_moderation',
  timestamps: true,
  indexes: [
    { fields: ['resource_type'] },
    { fields: ['resource_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

ContentModeration.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });
ContentModeration.belongsTo(User, { foreignKey: 'moderator_id', as: 'moderator' });

module.exports = ContentModeration;
