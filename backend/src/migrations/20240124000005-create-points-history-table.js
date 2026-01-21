const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('points_history', {
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
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      activity_type: {
        type: Sequelize.ENUM(
          'quiz_completed',
          'assignment_submitted',
          'course_completed',
          'discussion_participated',
          'lesson_completed',
          'badge_earned',
          'streak_bonus',
          'daily_login'
        ),
        allowNull: false
      },
      resource_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resource_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      multiplier: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.0
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('points_history', ['user_id']);
    await queryInterface.addIndex('points_history', ['created_at']);
    await queryInterface.addIndex('points_history', ['activity_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('points_history');
  }
};
