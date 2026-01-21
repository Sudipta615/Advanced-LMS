const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('discussion_comments', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      discussion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'course_discussions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parent_comment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'discussion_comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      is_marked_as_answer: {
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
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('discussion_comments', ['discussion_id']);
    await queryInterface.addIndex('discussion_comments', ['parent_comment_id']);
    await queryInterface.addIndex('discussion_comments', ['user_id']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('discussion_comments');
  }
};
