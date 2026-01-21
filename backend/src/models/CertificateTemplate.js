const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');
const User = require('./User');

const CertificateTemplate = sequelize.define('CertificateTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  template_html: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  background_image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  font_family: {
    type: DataTypes.STRING,
    defaultValue: 'Arial'
  },
  text_color: {
    type: DataTypes.STRING,
    defaultValue: '#000000'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'certificate_templates',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['is_default'] }
  ]
});

CertificateTemplate.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CertificateTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = CertificateTemplate;
