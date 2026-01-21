const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('user_preferences', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      theme: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        allowNull: false,
        defaultValue: 'system'
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en'
      },
      notifications_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      email_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      digest_frequency: {
        type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
        allowNull: false,
        defaultValue: 'immediate'
      },
      sidebar_collapsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC'
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

    await queryInterface.addIndex('user_preferences', ['user_id']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('user_preferences');
  }
};
