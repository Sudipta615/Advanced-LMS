const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('quiz_questions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      question_type: {
        type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
        allowNull: false
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('quiz_questions', ['quiz_id']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('quiz_questions');
  }
};
