const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');
const User = require('./User');

const CourseApproval = sequelize.define('CourseApproval', {
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
  submitted_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reviewer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewer_comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'course_approvals',
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['status'] },
    { fields: ['submitted_at'] }
  ]
});

CourseApproval.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CourseApproval.belongsTo(User, { foreignKey: 'submitted_by', as: 'submitter' });
CourseApproval.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

module.exports = CourseApproval;
