const PointsService = require('../services/PointsService');
const BadgeService = require('../services/BadgeService');
const AchievementService = require('../services/AchievementService');
const StreakService = require('../services/StreakService');
const LeaderboardService = require('../services/LeaderboardService');
const { Badge, BadgeCategory, User, sequelize } = require('../models');
const { ValidationError, DatabaseError } = require('sequelize');

class GamificationController {
  
  // =============================================================================
  // POINTS ENDPOINTS
  // =============================================================================

  /**
   * Get authenticated user's total points
   * GET /api/user/points
   */
  async getUserPoints(req, res, next) {
    try {
      const userId = req.user.id;
      
      const userPoints = await PointsService.getUserPoints(userId);
      
      res.status(200).json({
        success: true,
        data: {
          totalPoints: userPoints.total_points,
          courseCompletionPoints: userPoints.course_completion_points,
          quizPoints: userPoints.quiz_points,
          assignmentPoints: userPoints.assignment_points,
          discussionPoints: userPoints.discussion_points,
          streakBonusPoints: userPoints.streak_bonus_points,
          lastPointsUpdate: userPoints.last_points_update
        }
      });
    } catch (error) {
      console.error('Error getting user points:', error);
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database error occurred'
          }
        });
      }
      next(error);
    }
  }

  /**
   * Get paginated points history for authenticated user
   * GET /api/user/points/history
   */
  async getPointsHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, activityType, dateRange } = req.validatedQuery;
      
      const offset = (page - 1) * limit;
      const filters = {};
      
      if (activityType) {
        filters.activityType = activityType;
      }
      
      if (dateRange && dateRange.start && dateRange.end) {
        filters.dateRange = {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        };
      }
      
      const result = await PointsService.getPointsHistory(userId, limit, offset, filters);
      
      res.status(200).json({
        success: true,
        data: {
          history: result.history.map(entry => ({
            id: entry.id,
            pointsEarned: entry.points_earned,
            activityType: entry.activity_type,
            resourceType: entry.resource_type,
            resourceId: entry.resource_id,
            description: entry.description,
            createdAt: entry.created_at
          })),
          total: result.total,
          page: result.page,
          pageSize: result.pageSize
        }
      });
    } catch (error) {
      console.error('Error getting points history:', error);
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters'
          }
        });
      }
      next(error);
    }
  }

  // =============================================================================
  // BADGES ENDPOINTS
  // =============================================================================

  /**
   * Get all active badges
   * GET /api/badges
   */
  async getAllBadges(req, res, next) {
    try {
      const { category, limit = 20, page = 1 } = req.validatedQuery;
      
      let categoryId = null;
      if (category) {
        const badgeCategory = await BadgeCategory.findOne({
          where: { name: category }
        });
        if (!badgeCategory) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_CATEGORY',
              message: 'Invalid badge category'
            }
          });
        }
        categoryId = badgeCategory.id;
      }
      
      const offset = (page - 1) * limit;
      const badges = await BadgeService.getAllBadges(categoryId);
      
      // Get users count for each badge
      const badgesWithCounts = await Promise.all(
        badges.map(async (badge) => {
          const { count } = await badge.getUserBadges();
          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            category: badge.BadgeCategory ? badge.BadgeCategory.name : 'Unknown',
            iconUrl: badge.icon_url,
            criteriaType: badge.criteria_type,
            criteriaValue: badge.criteria_value,
            pointsAwarded: badge.points_awarded,
            difficultyLevel: badge.difficulty_level,
            usersCount: count
          };
        })
      );
      
      res.status(200).json({
        success: true,
        data: {
          badges: badgesWithCounts,
          total: badgesWithCounts.length
        }
      });
    } catch (error) {
      console.error('Error getting all badges:', error);
      next(error);
    }
  }

  /**
   * Get user's earned badges
   * GET /api/user/badges
   */
  async getUserBadges(req, res, next) {
    try {
      const userId = req.user.id;
      
      const userBadges = await BadgeService.getUnlockedBadges(userId);
      
      const badgesWithDetails = userBadges.map(userBadge => ({
        id: userBadge.Badge.id,
        name: userBadge.Badge.name,
        iconUrl: userBadge.Badge.icon_url,
        category: userBadge.Badge.BadgeCategory ? userBadge.Badge.BadgeCategory.name : 'Unknown',
        earnedAt: userBadge.earned_at,
        pointsAwarded: userBadge.Badge.points_awarded
      }));
      
      res.status(200).json({
        success: true,
        data: {
          badges: badgesWithDetails,
          count: badgesWithDetails.length
        }
      });
    } catch (error) {
      console.error('Error getting user badges:', error);
      next(error);
    }
  }

  /**
   * Get comprehensive badge progress for user
   * GET /api/user/badges/progress
   */
  async getBadgeProgress(req, res, next) {
    try {
      const userId = req.user.id;
      
      const badgeProgress = await BadgeService.getBadgeProgress(userId);
      
      res.status(200).json({
        success: true,
        data: badgeProgress
      });
    } catch (error) {
      console.error('Error getting badge progress:', error);
      next(error);
    }
  }

  /**
   * Get detailed badge information
   * GET /api/badges/:badgeId
   */
  async getBadgeDetails(req, res, next) {
    try {
      const { badgeId } = req.params;
      
      const badge = await BadgeService.getBadgeDetails(badgeId);
      
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BADGE_NOT_FOUND',
            message: 'Badge not found'
          }
        });
      }
      
      const earners = await BadgeService.getBadgeEarners(badgeId, 10, 0);
      
      res.status(200).json({
        success: true,
        data: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          category: badge.BadgeCategory ? badge.BadgeCategory.name : 'Unknown',
          iconUrl: badge.icon_url,
          criteriaType: badge.criteria_type,
          criteriaValue: badge.criteria_value,
          pointsAwarded: badge.points_awarded,
          difficultyLevel: badge.difficulty_level,
          earnedCount: earners.count,
          earners: earners.rows.map(earner => ({
            user: {
              id: earner.User.id,
              name: `${earner.User.first_name} ${earner.User.last_name}`,
              avatar: earner.User.profile_picture_url
            },
            earnedAt: earner.earned_at
          }))
        }
      });
    } catch (error) {
      console.error('Error getting badge details:', error);
      next(error);
    }
  }

  // =============================================================================
  // ACHIEVEMENTS ENDPOINTS
  // =============================================================================

  /**
   * Get user's unlocked achievements
   * GET /api/user/achievements
   */
  async getUserAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      
      const achievements = await AchievementService.getUnlockedAchievements(userId);
      
      res.status(200).json({
        success: true,
        data: {
          achievements: achievements,
          count: achievements.length
        }
      });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      next(error);
    }
  }

  /**
   * Get available (not yet unlocked) achievements
   * GET /api/achievements/available
   */
  async getAvailableAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      
      const availableAchievements = await AchievementService.getAvailableAchievements(userId);
      
      res.status(200).json({
        success: true,
        data: {
          availableAchievements: availableAchievements,
          count: availableAchievements.length
        }
      });
    } catch (error) {
      console.error('Error getting available achievements:', error);
      next(error);
    }
  }

  // =============================================================================
  // STREAK ENDPOINTS
  // =============================================================================

  /**
   * Get user's streak information
   * GET /api/user/streaks
   */
  async getUserStreaks(req, res, next) {
    try {
      const userId = req.user.id;
      
      const streakInfo = await StreakService.getStreakInfo(userId);
      
      res.status(200).json({
        success: true,
        data: streakInfo
      });
    } catch (error) {
      console.error('Error getting user streaks:', error);
      next(error);
    }
  }

  /**
   * Get activity calendar for heatmap display
   * GET /api/user/streaks/calendar
   */
  async getStreakCalendar(req, res, next) {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.validatedQuery;
      
      const calendarData = await StreakService.getStreakCalendarData(userId, days);
      
      res.status(200).json({
        success: true,
        data: calendarData
      });
    } catch (error) {
      console.error('Error getting streak calendar:', error);
      next(error);
    }
  }

  // =============================================================================
  // LEADERBOARD ENDPOINTS
  // =============================================================================

  /**
   * Get global leaderboard
   * GET /api/leaderboards/global
   */
  async getGlobalLeaderboard(req, res, next) {
    try {
      const { period = 'all_time', limit = 10, page = 1 } = req.validatedQuery;
      
      const offset = (page - 1) * limit;
      const leaderboard = await LeaderboardService.getLeaderboard(null, period, limit, offset);
      
      res.status(200).json({
        success: true,
        data: {
          leaderboard: leaderboard.rows.map(entry => ({
            rank: entry.rank,
            user: {
              id: entry.User.id,
              name: `${entry.User.first_name} ${entry.User.last_name}`,
              avatar: entry.User.profile_picture_url
            },
            totalPoints: entry.total_points,
            badgesCount: entry.badges_count,
            coursesCompleted: entry.courses_completed
          })),
          total: leaderboard.count,
          period,
          page,
          pageSize: limit
        }
      });
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      next(error);
    }
  }

  /**
   * Get course-specific leaderboard
   * GET /api/leaderboards/courses/:courseId
   */
  async getCourseLeaderboard(req, res, next) {
    try {
      const { courseId } = req.params;
      const { period = 'all_time', limit = 10, page = 1 } = req.validatedQuery;
      
      // Verify course exists (this would need to be implemented based on your Course model)
      // const course = await Course.findByPk(courseId);
      // if (!course) {
      //   return res.status(404).json({
      //     success: false,
      //     error: {
      //       code: 'COURSE_NOT_FOUND',
      //       message: 'Course not found'
      //     }
      //   });
      // }
      
      const offset = (page - 1) * limit;
      const leaderboard = await LeaderboardService.getLeaderboard(courseId, period, limit, offset);
      
      res.status(200).json({
        success: true,
        data: {
          leaderboard: leaderboard.rows.map(entry => ({
            rank: entry.rank,
            user: {
              id: entry.User.id,
              name: `${entry.User.first_name} ${entry.User.last_name}`,
              avatar: entry.User.profile_picture_url
            },
            totalPoints: entry.total_points,
            badgesCount: entry.badges_count,
            coursesCompleted: entry.courses_completed
          })),
          total: leaderboard.count,
          period,
          page,
          pageSize: limit
        }
      });
    } catch (error) {
      console.error('Error getting course leaderboard:', error);
      next(error);
    }
  }

  /**
   * Get user's rank information
   * GET /api/user/rank
   */
  async getUserRank(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = 'all_time', courseId } = req.validatedQuery;
      
      const userRank = await LeaderboardService.getUserRank(userId, courseId, period);
      
      if (!userRank) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RANK_NOT_FOUND',
            message: 'User rank not found'
          }
        });
      }
      
      const neighbors = await LeaderboardService.getNeighborUsers(userRank.rank, courseId, period);
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userRank.User.id,
            name: `${userRank.User.first_name} ${userRank.User.last_name}`,
            avatar: userRank.User.profile_picture_url
          },
          rank: userRank.rank,
          totalPoints: userRank.total_points,
          badgesCount: userRank.badges_count,
          period,
          courseId,
          percentile: userRank.percentile,
          neighbors: neighbors.map(neighbor => ({
            rank: neighbor.rank,
            user: {
              id: neighbor.User.id,
              name: `${neighbor.User.first_name} ${neighbor.User.last_name}`,
              avatar: neighbor.User.profile_picture_url
            },
            points: neighbor.total_points
          }))
        }
      });
    } catch (error) {
      console.error('Error getting user rank:', error);
      next(error);
    }
  }

  // =============================================================================
  // ADMIN ENDPOINTS
  // =============================================================================

  /**
   * Trigger leaderboard recalculation
   * POST /api/admin/gamification/recalculate-leaderboards
   */
  async recalculateLeaderboards(req, res, next) {
    try {
      const result = await LeaderboardService.recalculateLeaderboards();
      
      res.status(200).json({
        success: true,
        data: {
          success: true,
          globalCount: result.globalCount,
          courseCount: result.courseCount,
          message: result.message
        }
      });
    } catch (error) {
      console.error('Error recalculating leaderboards:', error);
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database error during leaderboard recalculation'
          }
        });
      }
      next(error);
    }
  }

  /**
   * Manually award badge to user
   * POST /api/admin/gamification/badges/:badgeId/award
   */
  async awardBadgeToUser(req, res, next) {
    try {
      const { badgeId } = req.params;
      const { userId } = req.validatedBody;
      
      // Verify badge exists
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BADGE_NOT_FOUND',
            message: 'Badge not found'
          }
        });
      }
      
      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      // Check if user already has badge
      const alreadyEarned = await BadgeService.checkBadgeEarned(userId, badgeId);
      if (alreadyEarned) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'BADGE_ALREADY_EARNED',
            message: 'User already has this badge'
          }
        });
      }
      
      const result = await BadgeService.awardBadgeToUser(userId, badgeId);
      
      res.status(200).json({
        success: true,
        data: {
          success: true,
          badge: {
            id: badge.id,
            name: badge.name,
            iconUrl: badge.icon_url,
            pointsAwarded: badge.points_awarded
          },
          user: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('Error awarding badge to user:', error);
      next(error);
    }
  }

  /**
   * Get gamification statistics
   * GET /api/admin/gamification/stats
   */
  async getGamificationStats(req, res, next) {
    try {
      const { Badge, UserBadge, UserPoint, LearningStreak } = require('../models');
      
      const [
        totalBadges,
        totalBadgesEarned,
        averageBadgesPerUser,
        totalPointsAwarded,
        averagePointsPerUser,
        streakStatistics
      ] = await Promise.all([
        Badge.count({ where: { is_active: true } }),
        UserBadge.count(),
        UserBadge.count() / await User.count({ where: { is_active: true } }),
        UserPoint.sum('total_points'),
        UserPoint.findAll({
          attributes: [[sequelize.fn('AVG', sequelize.col('total_points')), 'avgPoints']]
        }),
        LearningStreak.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('current_streak_days')), 'avgCurrentStreak'],
            [sequelize.fn('MAX', sequelize.col('longest_streak_days')), 'maxStreak'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers']
          ]
        })
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          totalBadges,
          totalBadgesEarned,
          averageBadgesPerUser: Math.round(averageBadgesPerUser * 100) / 100,
          totalPointsAwarded,
          averagePointsPerUser: averagePointsPerUser[0].dataValues.avgPoints || 0,
          leaderboardLastUpdated: new Date(),
          streakStatistics: {
            averageCurrentStreak: streakStatistics[0].dataValues.avgCurrentStreak || 0,
            maxStreak: streakStatistics[0].dataValues.maxStreak || 0,
            totalUsers: streakStatistics[0].dataValues.totalUsers || 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting gamification stats:', error);
      next(error);
    }
  }

  // =============================================================================
  // BADGE ADMIN ENDPOINTS
  // =============================================================================

  /**
   * Create new badge (Admin only)
   * POST /api/admin/badges
   */
  async createBadge(req, res, next) {
    try {
      const badgeData = req.validatedBody;
      
      const badge = await Badge.create(badgeData);
      
      res.status(201).json({
        success: true,
        message: 'Badge created successfully',
        data: badge
      });
    } catch (error) {
      console.error('Error creating badge:', error);
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid badge data',
            details: error.errors.map(err => ({
              field: err.path,
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  }

  /**
   * Update badge (Admin only)
   * PUT /api/admin/badges/:badgeId
   */
  async updateBadge(req, res, next) {
    try {
      const { badgeId } = req.params;
      const updateData = req.validatedBody;
      
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BADGE_NOT_FOUND',
            message: 'Badge not found'
          }
        });
      }
      
      await badge.update(updateData);
      
      res.status(200).json({
        success: true,
        message: 'Badge updated successfully',
        data: badge
      });
    } catch (error) {
      console.error('Error updating badge:', error);
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid badge data',
            details: error.errors.map(err => ({
              field: err.path,
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  }

  /**
   * Deactivate/delete badge (Admin only)
   * DELETE /api/admin/badges/:badgeId
   */
  async deleteBadge(req, res, next) {
    try {
      const { badgeId } = req.params;
      
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BADGE_NOT_FOUND',
            message: 'Badge not found'
          }
        });
      }
      
      // Soft delete by setting isActive to false
      await badge.update({ is_active: false });
      
      res.status(200).json({
        success: true,
        message: 'Badge deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating badge:', error);
      next(error);
    }
  }
}

module.exports = new GamificationController();