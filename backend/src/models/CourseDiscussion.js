const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');
const Lesson = require('./Lesson');
const User = require('./User');

const CourseDiscussion = sequelize.define('CourseDiscussion', {
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
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
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
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'course_discussions',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['lesson_id'] },
    { fields: ['created_at'] }
  ]
});

CourseDiscussion.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CourseDiscussion.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
CourseDiscussion.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = CourseDiscussion;
