const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Lesson = require('./Lesson');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
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
    allowNull: false,
    validate: {
      len: [20, 10000]
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  passing_score: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submission_type: {
    type: DataTypes.ENUM('file', 'text', 'url', 'multi_file'),
    allowNull: false
  },
  allowed_file_types: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  max_file_size_mb: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  max_submissions: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  indexes: [
    { fields: ['lesson_id'] },
    { fields: ['is_published'] }
  ]
});

Assignment.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

module.exports = Assignment;
