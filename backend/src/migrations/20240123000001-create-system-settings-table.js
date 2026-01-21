const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('system_settings', {
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('system_settings', ['setting_key']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('system_settings');
  }
};
