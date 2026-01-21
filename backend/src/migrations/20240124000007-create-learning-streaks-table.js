const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('learning_streaks', {
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
      current_streak_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      longest_streak_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_activity_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      streak_started_at: {
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

    await queryInterface.addIndex('learning_streaks', ['user_id']);
    await queryInterface.addIndex('learning_streaks', ['current_streak_days']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('learning_streaks');
  }
};
