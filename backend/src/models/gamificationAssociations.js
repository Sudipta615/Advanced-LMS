// Gamification Associations Setup
// This file sets up associations between gamification models to avoid circular dependencies

const UserPoint = require('./UserPoint');
const UserBadge = require('./UserBadge');
const PointsHistory = require('./PointsHistory');
const Achievement = require('./Achievement');
const LearningStreak = require('./LearningStreak');
const Leaderboard = require('./Leaderboard');
const Badge = require('./Badge');
const BadgeCategory = require('./BadgeCategory');

/**
 * Setup all gamification model associations
 * This should be called after all models are loaded
 */
function setupGamificationAssociations(User, Course) {
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

  // Badge relationships
  BadgeCategory.hasMany(Badge, { foreignKey: 'category_id', as: 'badges' });
  Badge.belongsTo(BadgeCategory, { foreignKey: 'category_id', as: 'category' });

  Badge.hasMany(UserBadge, { foreignKey: 'badge_id', as: 'userBadges' });
  UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });

  // Course associations with gamification models
  if (Course) {
    Course.hasMany(Leaderboard, { foreignKey: 'course_id', as: 'leaderboards' });
    Leaderboard.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
  }
}

module.exports = {
  setupGamificationAssociations
};