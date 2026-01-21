const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('backup_logs', {
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('backup_logs', ['created_at']);
    await queryInterface.addIndex('backup_logs', ['status']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('backup_logs');
  }
};
