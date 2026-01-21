const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.ENUM('course_update', 'assignment_due', 'quiz_grade', 'announcement', 'comment_reply', 'enrollment'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
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
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  action_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] }
  ]
});

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Notification;
