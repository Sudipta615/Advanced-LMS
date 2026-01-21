const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enrollments', {
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
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      enrolled_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      completion_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'dropped'),
        defaultValue: 'active'
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      certificate_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      last_accessed_at: {
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

    await queryInterface.addIndex('enrollments', ['user_id']);
    await queryInterface.addIndex('enrollments', ['course_id']);
    await queryInterface.addIndex('enrollments', ['status']);
    await queryInterface.addIndex('enrollments', ['created_at']);
    await queryInterface.addIndex('enrollments', ['user_id', 'course_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('enrollments');
  }
};