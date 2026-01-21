const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BackupLog = sequelize.define('BackupLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  backup_type: {
    type: DataTypes.ENUM('full', 'incremental'),
    allowNull: false,
    defaultValue: 'full'
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size_mb: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('completed', 'failed', 'in_progress'),
    allowNull: false,
    defaultValue: 'in_progress'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'backup_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['created_at'] },
    { fields: ['status'] }
  ]
});

module.exports = BackupLog;
