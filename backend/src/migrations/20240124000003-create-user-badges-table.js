const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_badges', {
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
      badge_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'badges',
          key: 'id'
        }
      },
      earned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      total_points_from_badge: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('user_badges', ['user_id']);
    await queryInterface.addIndex('user_badges', ['badge_id']);
    await queryInterface.addIndex('user_badges', ['earned_at']);
    await queryInterface.addIndex('user_badges', ['user_id', 'badge_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_badges');
  }
};
