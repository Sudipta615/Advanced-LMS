const fs = require('fs');
const path = require('path');

console.log('🔄 Verifying model structure and associations...\n');

const models = [
  {
    file: 'BadgeCategory.js',
    expectedAssociations: ['hasMany'],
    relatedModels: ['Badge'],
    expectedFields: ['id', 'name', 'description', 'icon_color']
  },
  {
    file: 'Badge.js',
    expectedAssociations: ['belongsTo', 'hasMany'],
    relatedModels: ['BadgeCategory', 'UserBadge'],
    expectedFields: ['id', 'name', 'description', 'category_id', 'icon_url', 'criteria_type', 'criteria_value', 'points_awarded', 'difficulty_level', 'is_active']
  },
  {
    file: 'UserBadge.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User', 'Badge'],
    expectedFields: ['id', 'user_id', 'badge_id', 'earned_at', 'total_points_from_badge']
  },
  {
    file: 'UserPoint.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User'],
    expectedFields: ['id', 'user_id', 'total_points', 'course_completion_points', 'quiz_points', 'assignment_points', 'discussion_points', 'streak_bonus_points', 'points_history_count', 'last_points_update']
  },
  {
    file: 'PointsHistory.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User'],
    expectedFields: ['id', 'user_id', 'points_earned', 'activity_type', 'resource_type', 'resource_id', 'multiplier', 'description']
  },
  {
    file: 'Achievement.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User'],
    expectedFields: ['id', 'user_id', 'achievement_type', 'achievement_data', 'unlocked_at']
  },
  {
    file: 'LearningStreak.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User'],
    expectedFields: ['id', 'user_id', 'current_streak_days', 'longest_streak_days', 'last_activity_date', 'streak_started_at']
  },
  {
    file: 'Leaderboard.js',
    expectedAssociations: ['belongsTo'],
    relatedModels: ['User', 'Course'],
    expectedFields: ['id', 'user_id', 'course_id', 'rank', 'total_points', 'badges_count', 'courses_completed', 'ranking_period']
  }
];

console.log('Checking model files:\n');

models.forEach(model => {
  const filePath = path.join(__dirname, '../models', model.file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📄 ${model.file}`);
  
  const hasSequelize = content.includes('sequelize.define');
  const hasDataTypes = content.includes('DataTypes');
  const exportsModule = content.includes('module.exports');
  
  console.log(`   ${hasSequelize ? '✅' : '❌'} Uses sequelize.define`);
  console.log(`   ${hasDataTypes ? '✅' : '❌'} Imports DataTypes`);
  console.log(`   ${exportsModule ? '✅' : '❌'} Exports module`);
  
  let missingFields = [];
  model.expectedFields.forEach(field => {
    if (!content.includes(field)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    console.log(`   ✅ All ${model.expectedFields.length} fields defined`);
  } else {
    console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
  }
  
  let missingAssociations = [];
  model.expectedAssociations.forEach(assoc => {
    if (!content.includes(assoc)) {
      missingAssociations.push(assoc);
    }
  });
  
  if (missingAssociations.length === 0) {
    console.log(`   ✅ All associations defined`);
  } else {
    console.log(`   ❌ Missing associations: ${missingAssociations.join(', ')}`);
  }
  
  let missingRelated = [];
  model.relatedModels.forEach(related => {
    if (!content.includes(related)) {
      missingRelated.push(related);
    }
  });
  
  if (missingRelated.length === 0) {
    console.log(`   ✅ All related models referenced`);
  } else {
    console.log(`   ❌ Missing related models: ${missingRelated.join(', ')}`);
  }
  
  console.log('');
});

console.log('✅ Model structure verification complete!\n');
