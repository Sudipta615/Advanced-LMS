const { sequelize } = require('../config/database');
const { Role } = require('../models');

const seedRoles = async () => {
  try {
    console.log('🔄 Starting database seeding...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const roles = [
      {
        name: 'student',
        permissions: [
          'course:view',
          'course:enroll',
          'lesson:view',
          'assignment:submit',
          'quiz:take',
          'profile:view',
          'profile:edit'
        ]
      },
      {
        name: 'instructor',
        permissions: [
          'course:view',
          'course:create',
          'course:edit',
          'course:delete',
          'lesson:view',
          'lesson:create',
          'lesson:edit',
          'lesson:delete',
          'assignment:view',
          'assignment:create',
          'assignment:edit',
          'assignment:grade',
          'quiz:view',
          'quiz:create',
          'quiz:edit',
          'student:view',
          'profile:view',
          'profile:edit'
        ]
      },
      {
        name: 'admin',
        permissions: [
          'user:view',
          'user:create',
          'user:edit',
          'user:delete',
          'course:view',
          'course:create',
          'course:edit',
          'course:delete',
          'lesson:view',
          'lesson:create',
          'lesson:edit',
          'lesson:delete',
          'assignment:view',
          'assignment:create',
          'assignment:edit',
          'assignment:delete',
          'assignment:grade',
          'quiz:view',
          'quiz:create',
          'quiz:edit',
          'quiz:delete',
          'role:manage',
          'audit:view',
          'system:manage'
        ]
      }
    ];

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      
      if (created) {
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }

    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedRoles();
