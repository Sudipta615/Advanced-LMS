const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('content_moderation', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      resource_type: {
        type: DataTypes.ENUM('discussion_comment', 'announcement', 'user_profile', 'course'),
        allowNull: false
      },
      resource_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reported_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      moderation_type: {
        type: DataTypes.ENUM('report', 'flag', 'auto_filter'),
        allowNull: false,
        defaultValue: 'report'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'removed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      moderator_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      moderator_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      action_taken: {
        type: DataTypes.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('content_moderation', ['resource_type']);
    await queryInterface.addIndex('content_moderation', ['resource_id']);
    await queryInterface.addIndex('content_moderation', ['status']);
    await queryInterface.addIndex('content_moderation', ['created_at']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('content_moderation');
  }
};
