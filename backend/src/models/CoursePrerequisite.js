const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const CoursePrerequisite = sequelize.define('CoursePrerequisite', {
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
  prerequisite_course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  min_completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  tableName: 'course_prerequisites',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['prerequisite_course_id'] }
  ]
});

CoursePrerequisite.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CoursePrerequisite.belongsTo(Course, { foreignKey: 'prerequisite_course_id', as: 'prerequisite_course' });

module.exports = CoursePrerequisite;