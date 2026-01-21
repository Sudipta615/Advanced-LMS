const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('course_discussions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'lessons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_locked: {
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

    await queryInterface.addIndex('course_discussions', ['course_id']);
    await queryInterface.addIndex('course_discussions', ['lesson_id']);
    await queryInterface.addIndex('course_discussions', ['created_at']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('course_discussions');
  }
};
