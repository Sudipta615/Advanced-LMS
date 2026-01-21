const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('certificate_templates', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      template_html: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      background_image_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      font_family: {
        type: DataTypes.STRING,
        defaultValue: 'Arial'
      },
      text_color: {
        type: DataTypes.STRING,
        defaultValue: '#000000'
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('certificate_templates', ['course_id']);
    await queryInterface.addIndex('certificate_templates', ['is_default']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('certificate_templates');
  }
};
