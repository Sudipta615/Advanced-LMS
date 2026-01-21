const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Enrollment = require('./Enrollment');
const User = require('./User');
const Course = require('./Course');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  certificate_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  issued_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qr_code_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  certificate_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { fields: ['certificate_number'] },
    { fields: ['verification_token'] }
  ]
});

Certificate.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
Certificate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Certificate.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = Certificate;
