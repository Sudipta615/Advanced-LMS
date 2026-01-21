const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('course_prerequisites', {
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
      prerequisite_course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      min_completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('course_prerequisites', ['course_id']);
    await queryInterface.addIndex('course_prerequisites', ['prerequisite_course_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('course_prerequisites');
  }
};