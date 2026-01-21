const fs = require('fs');
const path = require('path');

console.log('🔄 Testing model structure...\n');

const modelsPath = path.join(__dirname, '../models');
const migrationFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.js') && f.startsWith('20240124'))
  .sort();

console.log('✅ Found gamification migration files:');
migrationFiles.forEach(file => {
  console.log(`   - ${file}`);
});

const modelFiles = [
  'BadgeCategory.js',
  'Badge.js',
  'UserBadge.js',
  'UserPoint.js',
  'PointsHistory.js',
  'Achievement.js',
  'LearningStreak.js',
  'Leaderboard.js'
];

console.log('\n✅ Checking for model files:');
modelFiles.forEach(file => {
  const exists = fs.existsSync(path.join(modelsPath, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n✅ Verifying models/index.js exports:');
const indexContent = fs.readFileSync(path.join(modelsPath, 'index.js'), 'utf8');
const expectedExports = [
  'BadgeCategory',
  'Badge',
  'UserBadge',
  'UserPoint',
  'PointsHistory',
  'Achievement',
  'LearningStreak',
  'Leaderboard'
];

expectedExports.forEach(exportName => {
  const exported = indexContent.includes(exportName);
  console.log(`   ${exported ? '✅' : '❌'} ${exportName}`);
});

console.log('\n✅ Summary:');
console.log(`   Migration files: ${migrationFiles.length}/8`);
console.log(`   Model files: ${modelFiles.filter(f => fs.existsSync(path.join(modelsPath, f))).length}/8`);
console.log(`   Exported models: ${expectedExports.filter(e => indexContent.includes(e)).length}/8`);

console.log('\n✅ Verification complete!\n');
