const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BadgeCategory = sequelize.define('BadgeCategory', {
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
    allowNull: true
  },
  icon_color: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'badge_categories',
  timestamps: true,
  indexes: [
    { fields: ['name'] }
  ]
});

module.exports = BadgeCategory;
