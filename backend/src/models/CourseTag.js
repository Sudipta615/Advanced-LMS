const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const CourseTag = sequelize.define('CourseTag', {
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
  tag: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'course_tags',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['tag'] }
  ]
});

CourseTag.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = CourseTag;