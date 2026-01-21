const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lessons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      section_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sections',
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
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lesson_type: {
        type: Sequelize.ENUM('video', 'document', 'quiz', 'assignment', 'text'),
        defaultValue: 'text'
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      video_provider: {
        type: Sequelize.ENUM('youtube', 'vimeo', 'self_hosted'),
        allowNull: true
      },
      self_hosted_video_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      document_paths: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      external_links: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      markdown_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      requires_completion: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addIndex('lessons', ['section_id']);
    await queryInterface.addIndex('lessons', ['display_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lessons');
  }
};