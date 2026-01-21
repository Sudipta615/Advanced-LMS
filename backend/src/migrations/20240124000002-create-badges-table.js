const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('badges', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'badge_categories',
          key: 'id'
        }
      },
      icon_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      criteria_type: {
        type: Sequelize.ENUM(
          'courses_completed',
          'quiz_score',
          'streak_days',
          'assignments_submitted',
          'discussions_participated',
          'courses_passed',
          'total_points',
          'time_spent',
          'lessons_completed',
          'perfect_quizzes'
        ),
        allowNull: false
      },
      criteria_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      points_awarded: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      difficulty_level: {
        type: Sequelize.ENUM('bronze', 'silver', 'gold', 'platinum'),
        allowNull: false,
        defaultValue: 'bronze'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('badges', ['category_id']);
    await queryInterface.addIndex('badges', ['criteria_type']);
    await queryInterface.addIndex('badges', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('badges');
  }
};
