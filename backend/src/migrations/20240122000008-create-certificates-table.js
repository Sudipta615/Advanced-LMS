const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('certificates', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      certificate_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      issued_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      qr_code_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      certificate_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('certificates', ['user_id']);
    await queryInterface.addIndex('certificates', ['course_id']);
    await queryInterface.addIndex('certificates', ['certificate_number']);
    await queryInterface.addIndex('certificates', ['verification_token']);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('certificates');
  }
};
