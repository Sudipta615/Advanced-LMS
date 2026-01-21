const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instructor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private', 'restricted'),
        defaultValue: 'public'
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      difficulty_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      prerequisites: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      required_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      allow_retake: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      estimated_hours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      meta_description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      meta_keywords: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
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

    await queryInterface.addIndex('courses', ['title']);
    await queryInterface.addIndex('courses', ['slug']);
    await queryInterface.addIndex('courses', ['instructor_id']);
    await queryInterface.addIndex('courses', ['category_id']);
    await queryInterface.addIndex('courses', ['status']);
    await queryInterface.addIndex('courses', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('courses');
  }
};