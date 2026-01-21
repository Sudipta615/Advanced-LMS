const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('assignment_submissions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'assignments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      submission_number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      file_paths: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      external_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('submitted', 'grading', 'graded', 'late'),
        defaultValue: 'submitted'
      },
      score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      feedback: {
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

    await queryInterface.addIndex('assignment_submissions', ['assignment_id']);
    await queryInterface.addIndex('assignment_submissions', ['user_id']);
    await queryInterface.addIndex('assignment_submissions', ['status']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('assignment_submissions');
  }
};
