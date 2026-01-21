const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sections', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('sections', ['course_id']);
    await queryInterface.addIndex('sections', ['display_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sections');
  }
};