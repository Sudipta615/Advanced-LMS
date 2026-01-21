const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const UserBan = sequelize.define('UserBan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  banned_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ban_type: {
    type: DataTypes.ENUM('temporary', 'permanent'),
    allowNull: false,
    defaultValue: 'temporary'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_bans',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['expires_at'] }
  ]
});

UserBan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserBan.belongsTo(User, { foreignKey: 'banned_by', as: 'bannedBy' });

module.exports = UserBan;
