// Gamification Associations Setup
// This file sets up associations between gamification models to avoid circular dependencies

const UserPoint = require('./UserPoint');
const UserBadge = require('./UserBadge');
const PointsHistory = require('./PointsHistory');
const Achievement = require('./Achievement');
const LearningStreak = require('./LearningStreak');
const Leaderboard = require('./Leaderboard');

/**
 * Setup all gamification model associations
 * This should be called after all models are loaded
 */
function setupGamificationAssociations(User) {
  // User relationships
  User.hasOne(UserPoint, { foreignKey: 'user_id', as: 'points' });
  User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' });
  User.hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });
  User.hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' });
  User.hasOne(LearningStreak, { foreignKey: 'user_id', as: 'streaks' });
  User.hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' });

  // Reverse associations
  UserPoint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  PointsHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Achievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  LearningStreak.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Leaderboard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

module.exports = {
  setupGamificationAssociations
};