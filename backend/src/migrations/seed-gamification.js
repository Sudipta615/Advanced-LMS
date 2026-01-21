const { sequelize } = require('../config/database');
const { BadgeCategory, Badge } = require('../models');

const seedGamification = async () => {
  try {
    console.log('🔄 Starting gamification data seeding...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const badgeCategories = [
      {
        name: 'Achievement',
        description: 'Badges for achieving major milestones',
        icon_color: '#FFD700'
      },
      {
        name: 'Milestone',
        description: 'Badges for reaching important learning milestones',
        icon_color: '#4169E1'
      },
      {
        name: 'Skill',
        description: 'Badges for mastering specific skills',
        icon_color: '#32CD32'
      },
      {
        name: 'Social',
        description: 'Badges for community participation and engagement',
        icon_color: '#FF69B4'
      }
    ];

    console.log('📋 Creating badge categories...');
    const createdCategories = {};
    for (const categoryData of badgeCategories) {
      const [category, created] = await BadgeCategory.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });
      
      createdCategories[categoryData.name] = category.id;
      
      if (created) {
        console.log(`✅ Created badge category: ${categoryData.name}`);
      } else {
        console.log(`ℹ️  Badge category already exists: ${categoryData.name}`);
      }
    }

    const sampleBadges = [
      {
        name: 'First Steps',
        description: 'Complete your first course',
        category_id: createdCategories['Milestone'],
        criteria_type: 'courses_completed',
        criteria_value: 1,
        points_awarded: 50,
        difficulty_level: 'bronze',
        is_active: true
      },
      {
        name: 'Course Enthusiast',
        description: 'Complete 5 courses',
        category_id: createdCategories['Milestone'],
        criteria_type: 'courses_completed',
        criteria_value: 5,
        points_awarded: 200,
        difficulty_level: 'silver',
        is_active: true
      },
      {
        name: 'Learning Champion',
        description: 'Complete 10 courses',
        category_id: createdCategories['Milestone'],
        criteria_type: 'courses_completed',
        criteria_value: 10,
        points_awarded: 500,
        difficulty_level: 'gold',
        is_active: true
      },
      {
        name: 'Master Learner',
        description: 'Complete 25 courses',
        category_id: createdCategories['Milestone'],
        criteria_type: 'courses_completed',
        criteria_value: 25,
        points_awarded: 1000,
        difficulty_level: 'platinum',
        is_active: true
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        category_id: createdCategories['Achievement'],
        criteria_type: 'streak_days',
        criteria_value: 7,
        points_awarded: 100,
        difficulty_level: 'bronze',
        is_active: true
      },
      {
        name: 'Dedication Master',
        description: 'Maintain a 30-day learning streak',
        category_id: createdCategories['Achievement'],
        criteria_type: 'streak_days',
        criteria_value: 30,
        points_awarded: 500,
        difficulty_level: 'gold',
        is_active: true
      },
      {
        name: 'Quiz Master',
        description: 'Pass 10 quizzes',
        category_id: createdCategories['Skill'],
        criteria_type: 'courses_passed',
        criteria_value: 10,
        points_awarded: 250,
        difficulty_level: 'silver',
        is_active: true
      },
      {
        name: 'Perfect Score',
        description: 'Get perfect score on 5 quizzes',
        category_id: createdCategories['Skill'],
        criteria_type: 'perfect_quizzes',
        criteria_value: 5,
        points_awarded: 300,
        difficulty_level: 'gold',
        is_active: true
      },
      {
        name: 'Discussion Starter',
        description: 'Participate in 10 discussions',
        category_id: createdCategories['Social'],
        criteria_type: 'discussions_participated',
        criteria_value: 10,
        points_awarded: 150,
        difficulty_level: 'bronze',
        is_active: true
      },
      {
        name: 'Community Leader',
        description: 'Participate in 50 discussions',
        category_id: createdCategories['Social'],
        criteria_type: 'discussions_participated',
        criteria_value: 50,
        points_awarded: 600,
        difficulty_level: 'gold',
        is_active: true
      },
      {
        name: 'Assignment Pro',
        description: 'Submit 20 assignments',
        category_id: createdCategories['Achievement'],
        criteria_type: 'assignments_submitted',
        criteria_value: 20,
        points_awarded: 400,
        difficulty_level: 'silver',
        is_active: true
      },
      {
        name: 'Point Collector',
        description: 'Earn 1000 total points',
        category_id: createdCategories['Achievement'],
        criteria_type: 'total_points',
        criteria_value: 1000,
        points_awarded: 100,
        difficulty_level: 'silver',
        is_active: true
      },
      {
        name: 'Point Master',
        description: 'Earn 5000 total points',
        category_id: createdCategories['Achievement'],
        criteria_type: 'total_points',
        criteria_value: 5000,
        points_awarded: 500,
        difficulty_level: 'gold',
        is_active: true
      },
      {
        name: 'Lesson Explorer',
        description: 'Complete 50 lessons',
        category_id: createdCategories['Milestone'],
        criteria_type: 'lessons_completed',
        criteria_value: 50,
        points_awarded: 300,
        difficulty_level: 'silver',
        is_active: true
      },
      {
        name: 'Lesson Veteran',
        description: 'Complete 100 lessons',
        category_id: createdCategories['Milestone'],
        criteria_type: 'lessons_completed',
        criteria_value: 100,
        points_awarded: 700,
        difficulty_level: 'gold',
        is_active: true
      }
    ];

    console.log('🏅 Creating sample badges...');
    for (const badgeData of sampleBadges) {
      const [badge, created] = await Badge.findOrCreate({
        where: { name: badgeData.name },
        defaults: badgeData
      });
      
      if (created) {
        console.log(`✅ Created badge: ${badgeData.name} (${badgeData.difficulty_level})`);
      } else {
        console.log(`ℹ️  Badge already exists: ${badgeData.name}`);
      }
    }

    console.log('✅ Gamification data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gamification seeding failed:', error);
    process.exit(1);
  }
};

seedGamification();
