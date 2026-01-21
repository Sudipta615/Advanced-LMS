const { sequelize } = require('../config/database');
const { Role, User, PasswordResetToken, AuditLog, Category, Course, Section, Lesson, Enrollment, LessonCompletion, CoursePrerequisite, CourseTag } = require('../models');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    await sequelize.sync({ force: false });
    console.log('✅ All models synchronized successfully');

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
