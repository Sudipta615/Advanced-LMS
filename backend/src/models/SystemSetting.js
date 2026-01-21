const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  setting_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  setting_type: {
    type: DataTypes.ENUM('string', 'boolean', 'number', 'json'),
    allowNull: false,
    defaultValue: 'string'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'system_settings',
  timestamps: true,
  indexes: [
    { fields: ['setting_key'] },
    { unique: true, fields: ['setting_key'] },
    { fields: ['is_public'] }
  ]
});

module.exports = SystemSetting;
