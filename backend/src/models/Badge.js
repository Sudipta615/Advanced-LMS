const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const BadgeCategory = require('./BadgeCategory');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'badge_categories',
      key: 'id'
    }
  },
  icon_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  criteria_type: {
    type: DataTypes.ENUM(
      'courses_completed',
      'quiz_score',
      'streak_days',
      'assignments_submitted',
      'discussions_participated',
      'courses_passed',
      'total_points',
      'time_spent',
      'lessons_completed',
      'perfect_quizzes'
    ),
    allowNull: false
  },
  criteria_value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  points_awarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  difficulty_level: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    defaultValue: 'bronze'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'badges',
  timestamps: true,
  indexes: [
    { fields: ['category_id'] },
    { fields: ['criteria_type'] },
    { fields: ['is_active'] }
  ]
});

Badge.belongsTo(BadgeCategory, { foreignKey: 'category_id', as: 'category' });
BadgeCategory.hasMany(Badge, { foreignKey: 'category_id', as: 'badges' });

module.exports = Badge;
