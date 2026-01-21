const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('quiz_responses', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      quiz_attempt_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'quiz_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'quiz_questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      points_earned: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      instructor_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      graded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      graded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('quiz_responses', ['quiz_attempt_id']);
    await queryInterface.addIndex('quiz_responses', ['question_id']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('quiz_responses');
  }
};
