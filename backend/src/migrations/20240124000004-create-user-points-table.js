const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_points', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      total_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      course_completion_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      quiz_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      assignment_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      discussion_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      streak_bonus_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      points_history_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_points_update: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('user_points', ['user_id']);
    await queryInterface.addIndex('user_points', ['total_points']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_points');
  }
};
