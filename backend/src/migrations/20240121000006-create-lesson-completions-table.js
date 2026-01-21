const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lesson_completions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      lesson_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id'
        }
      },
      enrollment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'enrollments',
          key: 'id'
        }
      },
      completed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      time_spent_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('lesson_completions', ['user_id']);
    await queryInterface.addIndex('lesson_completions', ['lesson_id']);
    await queryInterface.addIndex('lesson_completions', ['completed_at']);
    await queryInterface.addIndex('lesson_completions', ['user_id', 'lesson_id', 'enrollment_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lesson_completions');
  }
};