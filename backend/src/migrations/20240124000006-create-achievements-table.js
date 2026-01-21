const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('achievements', {
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
      achievement_type: {
        type: Sequelize.ENUM(
          'first_course',
          'first_quiz_passed',
          'first_assignment',
          'first_discussion_post',
          'weekly_goal',
          'perfect_week',
          'comeback_learner'
        ),
        allowNull: false
      },
      achievement_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      unlocked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('achievements', ['user_id']);
    await queryInterface.addIndex('achievements', ['achievement_type']);
    await queryInterface.addIndex('achievements', ['unlocked_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('achievements');
  }
};
