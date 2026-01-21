const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('quiz_attempts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quiz_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'quizzes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enrollment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'enrollments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attempt_number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      time_spent_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      passed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('in_progress', 'submitted', 'graded'),
        defaultValue: 'in_progress'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('quiz_attempts', ['user_id']);
    await queryInterface.addIndex('quiz_attempts', ['quiz_id']);
    await queryInterface.addIndex('quiz_attempts', ['enrollment_id']);
    await queryInterface.addIndex('quiz_attempts', ['status']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('quiz_attempts');
  }
};
