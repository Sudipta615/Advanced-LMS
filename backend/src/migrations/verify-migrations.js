const fs = require('fs');
const path = require('path');

console.log('🔄 Verifying migration structure...\n');

const migrations = [
  {
    file: '20240124000001-create-badge-categories-table.js',
    table: 'badge_categories',
    expectedFields: ['id', 'name', 'description', 'icon_color', 'created_at', 'updated_at'],
    expectedIndexes: ['name']
  },
  {
    file: '20240124000002-create-badges-table.js',
    table: 'badges',
    expectedFields: ['id', 'name', 'description', 'category_id', 'icon_url', 'criteria_type', 'criteria_value', 'points_awarded', 'difficulty_level', 'is_active', 'created_at', 'updated_at'],
    expectedIndexes: ['category_id', 'criteria_type', 'is_active']
  },
  {
    file: '20240124000003-create-user-badges-table.js',
    table: 'user_badges',
    expectedFields: ['id', 'user_id', 'badge_id', 'earned_at', 'total_points_from_badge', 'created_at'],
    expectedIndexes: ['user_id', 'badge_id', 'earned_at']
  },
  {
    file: '20240124000004-create-user-points-table.js',
    table: 'user_points',
    expectedFields: ['id', 'user_id', 'total_points', 'course_completion_points', 'quiz_points', 'assignment_points', 'discussion_points', 'streak_bonus_points', 'points_history_count', 'last_points_update', 'created_at', 'updated_at'],
    expectedIndexes: ['user_id', 'total_points']
  },
  {
    file: '20240124000005-create-points-history-table.js',
    table: 'points_history',
    expectedFields: ['id', 'user_id', 'points_earned', 'activity_type', 'resource_type', 'resource_id', 'multiplier', 'description', 'created_at'],
    expectedIndexes: ['user_id', 'created_at', 'activity_type']
  },
  {
    file: '20240124000006-create-achievements-table.js',
    table: 'achievements',
    expectedFields: ['id', 'user_id', 'achievement_type', 'achievement_data', 'unlocked_at', 'created_at'],
    expectedIndexes: ['user_id', 'achievement_type', 'unlocked_at']
  },
  {
    file: '20240124000007-create-learning-streaks-table.js',
    table: 'learning_streaks',
    expectedFields: ['id', 'user_id', 'current_streak_days', 'longest_streak_days', 'last_activity_date', 'streak_started_at', 'created_at', 'updated_at'],
    expectedIndexes: ['user_id', 'current_streak_days']
  },
  {
    file: '20240124000008-create-leaderboards-table.js',
    table: 'leaderboards',
    expectedFields: ['id', 'user_id', 'course_id', 'rank', 'total_points', 'badges_count', 'courses_completed', 'ranking_period', 'updated_at', 'created_at'],
    expectedIndexes: ['course_id', 'ranking_period', 'rank', 'total_points']
  }
];

console.log('Checking migration files:\n');

migrations.forEach(migration => {
  const filePath = path.join(__dirname, migration.file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📄 ${migration.file}`);
  console.log(`   Table: ${migration.table}`);
  
  const hasUp = content.includes('up: async');
  const hasDown = content.includes('down: async');
  const hasCreateTable = content.includes(`createTable('${migration.table}'`);
  const hasDropTable = content.includes(`dropTable('${migration.table}'`);
  
  console.log(`   ${hasUp ? '✅' : '❌'} Has up migration`);
  console.log(`   ${hasDown ? '✅' : '❌'} Has down migration`);
  console.log(`   ${hasCreateTable ? '✅' : '❌'} Creates correct table`);
  console.log(`   ${hasDropTable ? '✅' : '❌'} Drops table in down`);
  
  let missingFields = [];
  migration.expectedFields.forEach(field => {
    if (!content.includes(field)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    console.log(`   ✅ All ${migration.expectedFields.length} fields present`);
  } else {
    console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
  }
  
  let missingIndexes = [];
  migration.expectedIndexes.forEach(index => {
    if (!content.includes(index)) {
      missingIndexes.push(index);
    }
  });
  
  if (missingIndexes.length === 0) {
    console.log(`   ✅ All ${migration.expectedIndexes.length} indexes present`);
  } else {
    console.log(`   ❌ Missing indexes: ${missingIndexes.join(', ')}`);
  }
  
  console.log('');
});

console.log('✅ Migration verification complete!\n');
