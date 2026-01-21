const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('quiz_answer_options', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
      option_text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('quiz_answer_options', ['question_id']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('quiz_answer_options');
  }
};
