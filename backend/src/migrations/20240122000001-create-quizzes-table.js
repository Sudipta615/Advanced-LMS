const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('quizzes', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      quiz_type: {
        type: DataTypes.ENUM('practice', 'graded', 'final'),
        allowNull: false
      },
      total_points: {
        type: DataTypes.INTEGER,
        defaultValue: 100
      },
      passing_score: {
        type: DataTypes.INTEGER,
        defaultValue: 70
      },
      time_limit_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allow_retake: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 3
      },
      randomize_questions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      show_correct_answers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      shuffle_options: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex('quizzes', ['lesson_id']);
    await queryInterface.addIndex('quizzes', ['is_published']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('quizzes');
  }
};
