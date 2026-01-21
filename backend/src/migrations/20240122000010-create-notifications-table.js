const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('notifications', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: DataTypes.ENUM('course_update', 'assignment_due', 'quiz_grade', 'announcement', 'comment_reply', 'enrollment'),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      resource_type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resource_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      action_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['is_read']);
    await queryInterface.addIndex('notifications', ['created_at']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('notifications');
  }
};
