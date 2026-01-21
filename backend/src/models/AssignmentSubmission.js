const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Assignment = require('./Assignment');
const User = require('./User');
const Enrollment = require('./Enrollment');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  assignment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'assignments',
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
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  submission_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_paths: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  external_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'grading', 'graded', 'late'),
    defaultValue: 'submitted'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  graded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'assignment_submissions',
  timestamps: true,
  indexes: [
    { fields: ['assignment_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'graded_by', as: 'grader' });
AssignmentSubmission.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

module.exports = AssignmentSubmission;
