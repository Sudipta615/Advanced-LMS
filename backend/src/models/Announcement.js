const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');
const User = require('./User');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pin_to_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'announcements',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['published_at'] }
  ]
});

Announcement.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Announcement;
