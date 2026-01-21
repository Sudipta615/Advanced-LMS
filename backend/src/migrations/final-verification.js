const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('   PHASE 5: GAMIFICATION SYSTEM - FINAL VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════\n');

const results = {
  migrations: 0,
  models: 0,
  exports: 0,
  errors: []
};

console.log('📋 MIGRATION FILES\n');

const expectedMigrations = [
  '20240124000001-create-badge-categories-table.js',
  '20240124000002-create-badges-table.js',
  '20240124000003-create-user-badges-table.js',
  '20240124000004-create-user-points-table.js',
  '20240124000005-create-points-history-table.js',
  '20240124000006-create-achievements-table.js',
  '20240124000007-create-learning-streaks-table.js',
  '20240124000008-create-leaderboards-table.js'
];

expectedMigrations.forEach(migration => {
  const filePath = path.join(__dirname, migration);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${migration}`);
  if (exists) results.migrations++;
  else results.errors.push(`Missing migration: ${migration}`);
});

console.log('\n📦 MODEL FILES\n');

const expectedModels = [
  'BadgeCategory.js',
  'Badge.js',
  'UserBadge.js',
  'UserPoint.js',
  'PointsHistory.js',
  'Achievement.js',
  'LearningStreak.js',
  'Leaderboard.js'
];

const modelsPath = path.join(__dirname, '../models');

expectedModels.forEach(model => {
  const filePath = path.join(modelsPath, model);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${model}`);
  if (exists) results.models++;
  else results.errors.push(`Missing model: ${model}`);
});

console.log('\n📤 MODEL EXPORTS\n');

const indexPath = path.join(modelsPath, 'index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');

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
  if (exported) results.exports++;
  else results.errors.push(`Missing export: ${exportName}`);
});

console.log('\n🌱 SEED FILE\n');

const seedPath = path.join(__dirname, 'seed-gamification.js');
const seedExists = fs.existsSync(seedPath);
console.log(`   ${seedExists ? '✅' : '❌'} seed-gamification.js`);

console.log('\n📚 DOCUMENTATION\n');

const docsPath = path.join(__dirname, '../../GAMIFICATION_PHASE5.md');
const docsExists = fs.existsSync(docsPath);
console.log(`   ${docsExists ? '✅' : '❌'} GAMIFICATION_PHASE5.md`);

const completePath = path.join(__dirname, '../../../PHASE5_GAMIFICATION_COMPLETE.md');
const completeExists = fs.existsSync(completePath);
console.log(`   ${completeExists ? '✅' : '❌'} PHASE5_GAMIFICATION_COMPLETE.md`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('   SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`   Migrations:     ${results.migrations}/8`);
console.log(`   Models:         ${results.models}/8`);
console.log(`   Exports:        ${results.exports}/8`);
console.log(`   Seed File:      ${seedExists ? '✅' : '❌'}`);
console.log(`   Documentation:  ${docsExists && completeExists ? '✅' : '❌'}`);

console.log('\n═══════════════════════════════════════════════════════════════');

if (results.migrations === 8 && results.models === 8 && results.exports === 8 && seedExists && docsExists && completeExists) {
  console.log('   ✅ ALL CHECKS PASSED - PHASE 5 COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.log('   ❌ SOME CHECKS FAILED');
  console.log('═══════════════════════════════════════════════════════════════\n');
  if (results.errors.length > 0) {
    console.log('Errors:\n');
    results.errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
  }
  process.exit(1);
}
