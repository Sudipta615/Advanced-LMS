const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  thumbnail_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'restricted'),
    defaultValue: 'public'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  required_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  allow_retake: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estimated_hours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  meta_description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meta_keywords: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'courses',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['title'] },
    { fields: ['slug'] },
    { fields: ['instructor_id'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
Course.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Course.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = Course;