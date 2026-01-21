const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const Section = sequelize.define('Section', {
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
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sections',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['display_order'] }
  ]
});

Section.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = Section;