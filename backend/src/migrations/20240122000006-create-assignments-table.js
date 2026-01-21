const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('assignments', {
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
        allowNull: false
      },
      instructions: {
        type: DataTypes.TEXT,
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
      due_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      submission_type: {
        type: DataTypes.ENUM('file', 'text', 'url', 'multi_file'),
        allowNull: false
      },
      allowed_file_types: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      max_file_size_mb: {
        type: DataTypes.INTEGER,
        defaultValue: 50
      },
      max_submissions: {
        type: DataTypes.INTEGER,
        defaultValue: 3
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

    await queryInterface.addIndex('assignments', ['lesson_id']);
    await queryInterface.addIndex('assignments', ['is_published']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('assignments');
  }
};
