const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leaderboards', {
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
      course_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      badges_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      courses_completed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ranking_period: {
        type: Sequelize.ENUM('all_time', 'monthly', 'weekly'),
        allowNull: false,
        defaultValue: 'all_time'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('leaderboards', ['course_id']);
    await queryInterface.addIndex('leaderboards', ['ranking_period']);
    await queryInterface.addIndex('leaderboards', ['rank']);
    await queryInterface.addIndex('leaderboards', ['total_points']);
    await queryInterface.addIndex('leaderboards', ['user_id', 'course_id', 'ranking_period'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leaderboards');
  }
};
