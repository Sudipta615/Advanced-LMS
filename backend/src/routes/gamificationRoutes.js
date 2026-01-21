const express = require('express');
const router = express.Router();

// Controllers
const GamificationController = require('../controllers/gamificationController');

// Middleware
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');

// Validators
const gamificationValidators = require('../validators/gamificationValidators');

// Rate limiters
const adminLimiter = require('../middleware/rateLimiter');

// =============================================================================
// POINTS ENDPOINTS
// =============================================================================

/**
 * GET /api/user/points
 * Get authenticated user's total points
 * @route GET /api/user/points
 * @group Points - Points management
 * @security JWT
 */
router.get(
  '/user/points',
  authenticateToken,
  GamificationController.getUserPoints
);

/**
 * GET /api/user/points/history
 * Get paginated points history for authenticated user
 * @route GET /api/user/points/history
 * @group Points - Points management
 * @security JWT
 * @query {integer} page - Page number (default: 1)
 * @query {integer} limit - Items per page (default: 20, max: 100)
 * @query {string} activityType - Filter by activity type (optional)
 * @query {string} dateRange - Date range filter (optional)
 */
router.get(
  '/user/points/history',
  authenticateToken,
  validateRequest(gamificationValidators.pointsHistorySchema),
  GamificationController.getPointsHistory
);

// =============================================================================
// BADGES ENDPOINTS
// =============================================================================

/**
 * GET /api/badges
 * Get all active badges (public endpoint)
 * @route GET /api/badges
 * @group Badges - Badge management
 * @query {string} category - Filter by category (optional)
 * @query {string} difficulty - Filter by difficulty level (optional)
 */
router.get(
  '/badges',
  validateRequest(gamificationValidators.badgesQuerySchema),
  GamificationController.getAllBadges
);

/**
 * GET /api/user/badges
 * Get user's earned badges
 * @route GET /api/user/badges
 * @group Badges - Badge management
 * @security JWT
 */
router.get(
  '/user/badges',
  authenticateToken,
  GamificationController.getUserBadges
);

/**
 * GET /api/user/badges/progress
 * Get comprehensive badge progress for user
 * @route GET /api/user/badges/progress
 * @group Badges - Badge management
 * @security JWT
 */
router.get(
  '/user/badges/progress',
  authenticateToken,
  GamificationController.getBadgeProgress
);

/**
 * GET /api/badges/:badgeId
 * Get detailed badge information
 * @route GET /api/badges/:badgeId
 * @group Badges - Badge management
 * @param {string} badgeId - Badge ID (UUID)
 */
router.get(
  '/badges/:badgeId',
  validateRequest(gamificationValidators.badgeIdSchema, 'params'),
  GamificationController.getBadgeDetails
);

// =============================================================================
// ACHIEVEMENTS ENDPOINTS
// =============================================================================

/**
 * GET /api/user/achievements
 * Get user's unlocked achievements
 * @route GET /api/user/achievements
 * @group Achievements - Achievement management
 * @security JWT
 */
router.get(
  '/user/achievements',
  authenticateToken,
  GamificationController.getUserAchievements
);

/**
 * GET /api/achievements/available
 * Get available (not yet unlocked) achievements
 * @route GET /api/achievements/available
 * @group Achievements - Achievement management
 * @security JWT
 */
router.get(
  '/achievements/available',
  authenticateToken,
  GamificationController.getAvailableAchievements
);

// =============================================================================
// STREAK ENDPOINTS
// =============================================================================

/**
 * GET /api/user/streaks
 * Get user's streak information
 * @route GET /api/user/streaks
 * @group Streaks - Streak management
 * @security JWT
 */
router.get(
  '/user/streaks',
  authenticateToken,
  GamificationController.getUserStreaks
);

/**
 * GET /api/user/streaks/calendar
 * Get activity calendar for heatmap display
 * @route GET /api/user/streaks/calendar
 * @group Streaks - Streak management
 * @security JWT
 * @query {integer} days - Number of days to fetch (default: 30, max: 365)
 */
router.get(
  '/user/streaks/calendar',
  authenticateToken,
  validateRequest(gamificationValidators.streakCalendarSchema),
  GamificationController.getStreakCalendar
);

// =============================================================================
// LEADERBOARD ENDPOINTS
// =============================================================================

/**
 * GET /api/leaderboards/global
 * Get global leaderboard
 * @route GET /api/leaderboards/global
 * @group Leaderboards - Leaderboard management
 * @query {string} period - Time period ('all_time' | 'monthly' | 'weekly', default: 'all_time')
 * @query {integer} limit - Number of entries (default: 10, max: 100)
 * @query {integer} page - Page number (default: 1)
 */
router.get(
  '/leaderboards/global',
  validateRequest(gamificationValidators.leaderboardQuerySchema),
  GamificationController.getGlobalLeaderboard
);

/**
 * GET /api/leaderboards/courses/:courseId
 * Get course-specific leaderboard
 * @route GET /api/leaderboards/courses/:courseId
 * @group Leaderboards - Leaderboard management
 * @param {string} courseId - Course ID (UUID)
 * @query {string} period - Time period ('all_time' | 'monthly' | 'weekly', default: 'all_time')
 * @query {integer} limit - Number of entries (default: 10, max: 100)
 * @query {integer} page - Page number (default: 1)
 */
router.get(
  '/leaderboards/courses/:courseId',
  validateRequest(gamificationValidators.courseLeaderboardSchema),
  GamificationController.getCourseLeaderboard
);

/**
 * GET /api/user/rank
 * Get user's rank information
 * @route GET /api/user/rank
 * @group Leaderboards - Leaderboard management
 * @security JWT
 * @query {string} period - Time period ('all_time' | 'monthly' | 'weekly', default: 'all_time')
 * @query {string} courseId - Course ID for course-specific ranking (optional)
 */
router.get(
  '/user/rank',
  authenticateToken,
  validateRequest(gamificationValidators.userRankSchema),
  GamificationController.getUserRank
);

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

/**
 * POST /api/admin/gamification/recalculate-leaderboards
 * Trigger leaderboard recalculation
 * @route POST /api/admin/gamification/recalculate-leaderboards
 * @group Admin - Gamification administration
 * @security JWT + Admin role
 */
router.post(
  '/admin/gamification/recalculate-leaderboards',
  authenticateToken,
  checkRole(['admin']),
  adminLimiter,
  GamificationController.recalculateLeaderboards
);

/**
 * POST /api/admin/gamification/badges/:badgeId/award
 * Manually award badge to user
 * @route POST /api/admin/gamification/badges/:badgeId/award
 * @group Admin - Gamification administration
 * @security JWT + Admin role
 * @param {string} badgeId - Badge ID (UUID)
 * @body {string} userId - User ID to award badge to
 */
router.post(
  '/admin/gamification/badges/:badgeId/award',
  authenticateToken,
  checkRole(['admin']),
  adminLimiter,
  validateRequest(gamificationValidators.awardBadgeSchema, 'body'),
  GamificationController.awardBadgeToUser
);

/**
 * GET /api/admin/gamification/stats
 * Get gamification statistics
 * @route GET /api/admin/gamification/stats
 * @group Admin - Gamification administration
 * @security JWT + Admin role
 */
router.get(
  '/admin/gamification/stats',
  authenticateToken,
  checkRole(['admin']),
  adminLimiter,
  GamificationController.getGamificationStats
);

// =============================================================================
// BADGE ADMIN ENDPOINTS
// =============================================================================

/**
 * POST /api/admin/badges
 * Create new badge (Admin only)
 * @route POST /api/admin/badges
 * @group Admin - Badge management
 * @security JWT + Admin role
 * @body {string} name - Badge name
 * @body {string} description - Badge description
 * @body {string} categoryId - Badge category ID
 * @body {string} iconUrl - Icon URL
 * @body {string} criteriaType - Criteria type
 * @body {integer} criteriaValue - Criteria value
 * @body {integer} pointsAwarded - Points to award
 * @body {string} difficultyLevel - Difficulty level
 */
router.post(
  '/admin/badges',
  authenticateToken,
  checkRole(['admin']),
  validateRequest(gamificationValidators.createBadgeSchema),
  GamificationController.createBadge
);

/**
 * PUT /api/admin/badges/:badgeId
 * Update badge (Admin only)
 * @route PUT /api/admin/badges/:badgeId
 * @group Admin - Badge management
 * @security JWT + Admin role
 * @param {string} badgeId - Badge ID (UUID)
 * @body {Object} badgeData - Partial badge data to update
 */
router.put(
  '/admin/badges/:badgeId',
  authenticateToken,
  checkRole(['admin']),
  validateRequest(gamificationValidators.badgeIdSchema, 'params'),
  validateRequest(gamificationValidators.updateBadgeSchema),
  GamificationController.updateBadge
);

/**
 * DELETE /api/admin/badges/:badgeId
 * Deactivate/delete badge (Admin only)
 * @route DELETE /api/admin/badges/:badgeId
 * @group Admin - Badge management
 * @security JWT + Admin role
 * @param {string} badgeId - Badge ID (UUID)
 */
router.delete(
  '/admin/badges/:badgeId',
  authenticateToken,
  checkRole(['admin']),
  validateRequest(gamificationValidators.badgeIdSchema, 'params'),
  GamificationController.deleteBadge
);

module.exports = router;