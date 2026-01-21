const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Section = require('./Section');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  section_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sections',
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lesson_type: {
    type: DataTypes.ENUM('video', 'document', 'quiz', 'assignment', 'text'),
    defaultValue: 'text'
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  video_provider: {
    type: DataTypes.ENUM('youtube', 'vimeo', 'self_hosted'),
    allowNull: true
  },
  self_hosted_video_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_paths: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  external_links: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  markdown_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requires_completion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  indexes: [
    { fields: ['section_id'] },
    { fields: ['display_order'] }
  ]
});

Lesson.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });

module.exports = Lesson;