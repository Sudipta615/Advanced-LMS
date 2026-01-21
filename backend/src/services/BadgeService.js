const { Badge, UserBadge, BadgeCategory, User, UserPoint, PointsHistory, LearningStreak, Enrollment, QuizAttempt, LessonCompletion, AssignmentSubmission, DiscussionComment, Lesson, sequelize } = require('../models');
const { Op } = require('sequelize');
const PointsService = require('./PointsService');
const NotificationService = require('./NotificationService');
const { CacheManager } = require('../utils/cacheManager');

class BadgeService {
  
  static async checkAndAwardBadges(userId, triggerType, triggerData = {}) {
    try {
      // Get all active badges matching this trigger type
      const candidateBadges = await Badge.findAll({
        where: {
          is_active: true,
          criteria_type: this.mapTriggerTypeToCriteria(triggerType)
        }
      });

      const badgesEarned = [];
      let totalPointsAwarded = 0;

      for (const badge of candidateBadges) {
        const alreadyEarned = await this.checkBadgeEarned(userId, badge.id);
        if (!alreadyEarned) {
          const criteriaMet = await this.evaluateBadgeCriteria(userId, badge, triggerData);
          
          if (criteriaMet) {
            const result = await this.awardBadgeToUser(userId, badge.id);
            badgesEarned.push({
              badge: await this.getBadgeDetails(badge.id),
              earned_at: result.userBadge.earned_at,
              points_awarded: result.pointsAwarded
            });
            totalPointsAwarded += result.pointsAwarded;
          }
        }
      }

      return {
        badgesEarned,
        pointsAwarded: totalPointsAwarded,
        count: badgesEarned.length
      };
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      throw error;
    }
  }

  static mapTriggerTypeToCriteria(triggerType) {
    const triggerMap = {
      'quiz_completed': ['quiz_score', 'perfect_quizzes', 'total_points'],
      'course_completed': ['courses_completed', 'courses_passed', 'total_points'],
      'assignment_submitted': ['assignments_submitted', 'total_points'],
      'discussion_participated': ['discussions_participated', 'total_points'],
      'lesson_completed': ['lessons_completed', 'time_spent', 'total_points'],
      'points_earned': ['total_points'],
      'streak_updated': ['streak_days', 'total_points'],
      'daily_check': [
        'courses_completed', 'quiz_score', 'streak_days', 'assignments_submitted',
        'discussions_participated', 'courses_passed', 'total_points',
        'time_spent', 'lessons_completed', 'perfect_quizzes'
      ]
    };
    
    return triggerMap[triggerType] || [
      'courses_completed', 'quiz_score', 'streak_days', 'assignments_submitted',
      'discussions_participated', 'courses_passed', 'total_points',
      'time_spent', 'lessons_completed', 'perfect_quizzes'
    ];
  }

  static async evaluateBadgeCriteria(userId, badge, triggerData = {}) {
    try {
      const { criteria_type, criteria_value } = badge;
      
      switch (criteria_type) {
        case 'courses_completed':
          const completedEnrollments = await Enrollment.count({
            where: {
              user_id: userId,
              status: 'completed'
            }
          });
          return completedEnrollments >= criteria_value;

        case 'quiz_score':
          const latestQuizScore = triggerData.quizScore || 0;
          return latestQuizScore >= criteria_value;

        case 'streak_days':
          const streak = await LearningStreak.findOne({
            where: { user_id: userId }
          });
          const currentStreak = streak ? streak.current_streak_days : 0;
          return currentStreak >= criteria_value;

        case 'assignments_submitted':
          const assignmentCount = await AssignmentSubmission.count({
            where: { user_id: userId }
          });
          return assignmentCount >= criteria_value;

        case 'discussions_participated':
          const discussionCount = await DiscussionComment.count({
            where: { user_id: userId }
          });
          return discussionCount >= criteria_value;

        case 'courses_passed':
          const passedCourses = await Enrollment.count({
            where: {
              user_id: userId,
              status: 'completed'
            }
          });
          // Check if any enrollment has a certificate (indicates passing)
          const passedWithCertificate = await Enrollment.count({
            where: {
              user_id: userId,
              certificate_id: { [Op.not]: null }
            }
          });
          return Math.max(passedCourses, passedWithCertificate) >= criteria_value;

        case 'total_points':
          const userPoints = await UserPoint.findOne({
            where: { user_id: userId }
          });
          const totalPoints = userPoints ? userPoints.total_points : 0;
          return totalPoints >= criteria_value;

        case 'time_spent':
          const lessonCompletions = await LessonCompletion.findAll({
            where: { user_id: userId },
            attributes: ['time_spent_seconds']
          });
          const totalTimeSpent = lessonCompletions.reduce((sum, lc) => sum + (lc.time_spent_seconds || 0), 0);
          const totalMinutes = Math.floor(totalTimeSpent / 60);
          return totalMinutes >= criteria_value;

        case 'lessons_completed':
          const lessonCount = await LessonCompletion.count({
            where: { user_id: userId }
          });
          return lessonCount >= criteria_value;

        case 'perfect_quizzes':
          const perfectAttempts = await QuizAttempt.count({
            where: {
              user_id: userId,
              score: 100,
              passed: true
            }
          });
          return perfectAttempts >= criteria_value;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating badge criteria for ${badge.criteria_type}:`, error);
      return false;
    }
  }

  static async getUnlockedBadges(userId) {
    try {
      const userBadges = await UserBadge.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Badge,
            as: 'badge',
            include: [
              {
                model: BadgeCategory,
                as: 'category'
              }
            ]
          }
        ],
        order: [['earned_at', 'DESC']]
      });

      const badges = userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon_url: ub.badge.icon_url,
        category: {
          id: ub.badge.category.id,
          name: ub.badge.category.name,
          icon_color: ub.badge.category.icon_color
        },
        earned_at: ub.earned_at,
        points_awarded: ub.total_points_from_badge,
        difficulty_level: ub.badge.difficulty_level
      }));

      return {
        badges,
        count: badges.length
      };
    } catch (error) {
      console.error('Error getting unlocked badges:', error);
      throw error;
    }
  }

  static async getAvailableBadges(userId) {
    try {
      // Get all active badges
      const allBadges = await Badge.findAll({
        where: { is_active: true },
        include: [
          {
            model: BadgeCategory,
            as: 'category'
          }
        ]
      });

      // Get user's earned badge IDs
      const earnedBadgeIds = await UserBadge.findAll({
        where: { user_id: userId },
        attributes: ['badge_id']
      }).then(ubs => ubs.map(ub => ub.badge_id));

      // Filter out earned badges
      const availableBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

      // Calculate progress for each available badge
      const availableWithProgress = await Promise.all(
        availableBadges.map(async (badge) => {
          const progress = await this.calculateBadgeProgress(userId, badge);
          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            category: {
              id: badge.category.id,
              name: badge.category.name,
              icon_color: badge.category.icon_color
            },
            criteria_type: badge.criteria_type,
            criteria_value: badge.criteria_value,
            current_value: progress.currentValue,
            percentage: progress.percentage,
            difficulty_level: badge.difficulty_level,
            remaining: progress.remaining
          };
        })
      );

      return {
        availableBadges: availableWithProgress,
        count: availableWithProgress.length
      };
    } catch (error) {
      console.error('Error getting available badges:', error);
      throw error;
    }
  }

  static async getBadgeProgress(userId) {
    try {
      const [unlockedBadges, availableBadges] = await Promise.all([
        this.getUnlockedBadges(userId),
        this.getAvailableBadges(userId)
      ]);

      // Count badges by difficulty
      const earnedCount = {
        bronze: unlockedBadges.badges.filter(b => b.difficulty_level === 'bronze').length,
        silver: unlockedBadges.badges.filter(b => b.difficulty_level === 'silver').length,
        gold: unlockedBadges.badges.filter(b => b.difficulty_level === 'gold').length,
        platinum: unlockedBadges.badges.filter(b => b.difficulty_level === 'platinum').length
      };

      // Find next badges to unlock (highest percentage, closest to criteria)
      const sortedAvailable = availableBadges.availableBadges
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      // Calculate total progress percentage (average of all badge progress)
      const totalProgress = availableBadges.availableBadges.length > 0
        ? Math.round(
            availableBadges.availableBadges.reduce((sum, badge) => sum + badge.percentage, 0) / 
            availableBadges.availableBadges.length
          )
        : 100; // All badges earned

      return {
        earnedCount,
        availableCount: availableBadges.count,
        nextBadges: sortedAvailable,
        totalProgress,
        totalEarned: unlockedBadges.count,
        totalAvailable: unlockedBadges.count + availableBadges.count
      };
    } catch (error) {
      console.error('Error getting badge progress:', error);
      throw error;
    }
  }

  static async getAllBadges(categoryId = null) {
    try {
      const where = { is_active: true };
      if (categoryId) {
        where.category_id = categoryId;
      }

      const badges = await Badge.findAll({
        where,
        include: [
          {
            model: BadgeCategory,
            as: 'category'
          }
        ],
        order: [
          ['category_id', 'ASC'],
          ['difficulty_level', 'ASC']
        ]
      });

      // Add user count for each badge
      const badgesWithCount = await Promise.all(
        badges.map(async (badge) => {
          const userCount = await UserBadge.count({
            where: { badge_id: badge.id }
          });

          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url,
            category: {
              id: badge.category.id,
              name: badge.category.name,
              icon_color: badge.category.icon_color
            },
            criteria_type: badge.criteria_type,
            criteria_value: badge.criteria_value,
            points_awarded: badge.points_awarded,
            difficulty_level: badge.difficulty_level,
            users_earned: userCount
          };
        })
      );

      return {
        badges: badgesWithCount,
        total: badgesWithCount.length
      };
    } catch (error) {
      console.error('Error getting all badges:', error);
      throw error;
    }
  }

  static async getBadgeDetails(badgeId) {
    try {
      const badge = await Badge.findOne({
        where: { id: badgeId, is_active: true },
        include: [
          {
            model: BadgeCategory,
            as: 'category'
          }
        ]
      });

      if (!badge) {
        return null;
      }

      const userCount = await UserBadge.count({
        where: { badge_id: badge.id }
      });

      // Generate tips based on criteria type
      const tips = this.generateBadgeTips(badge);

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
        category: {
          id: badge.category.id,
          name: badge.category.name,
          icon_color: badge.category.icon_color
        },
        criteria_type: badge.criteria_type,
        criteria_value: badge.criteria_value,
        points_awarded: badge.points_awarded,
        difficulty_level: badge.difficulty_level,
        users_earned: userCount,
        tips
      };
    } catch (error) {
      console.error('Error getting badge details:', error);
      throw error;
    }
  }

  static generateBadgeTips(badge) {
    const tipsMap = {
      'courses_completed': 'You need to complete ' + badge.criteria_value + ' courses to earn this badge. Check your current enrollments and finish any remaining lessons or assessments.',
      'quiz_score': 'Your next quiz score needs to be at least ' + badge.criteria_value + '%. Focus on reviewing course material before attempting quizzes.',
      'streak_days': 'This badge requires a ' + badge.criteria_value + '-day learning streak. Try to engage with the platform daily to maintain your streak.',
      'assignments_submitted': 'Submit ' + badge.criteria_value + ' assignments to earn this badge. Check for pending assignments in your enrolled courses.',
      'discussions_participated': 'Participate in ' + badge.criteria_value + ' discussion threads. Ask questions, answer others, or share your insights.',
      'courses_passed': 'Pass ' + badge.criteria_value + ' courses with a certificate to unlock this badge. Focus on maintaining high scores throughout your courses.',
      'total_points': 'You need ' + badge.criteria_value + ' total points to earn this badge. Keep completing activities to accumulate points.',
      'time_spent': 'Spend ' + badge.criteria_value + ' minutes learning on the platform. Your time spent completing lessons counts toward this goal.',
      'lessons_completed': 'Complete ' + badge.criteria_value + ' lessons across all your courses. Check for incomplete lessons in your active enrollments.',
      'perfect_quizzes': 'Score 100% on ' + badge.criteria_value + ' quizzes. Review material thoroughly before attempting quizzes for best results.'
    };

    return [tipsMap[badge.criteria_type] || 'Keep engaging with the platform to unlock this badge!'];
  }

  static async getBadgeEarners(badgeId, limit = 10, offset = 0) {
    try {
      const { count, rows } = await UserBadge.findAndCountAll({
        where: { badge_id: badgeId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'avatar_url']
          }
        ],
        order: [['earned_at', 'DESC']],
        limit,
        offset
      });

      const earners = rows.map(ub => ({
        user: {
          id: ub.user.id,
          username: ub.user.username,
          avatar_url: ub.user.avatar_url,
          email_hash: this.hashEmailForPrivacy(ub.user.email)
        },
        earned_at: ub.earned_at
      }));

      return {
        earners,
        total: count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      };
    } catch (error) {
      console.error('Error getting badge earners:', error);
      throw error;
    }
  }

  static hashEmailForPrivacy(email) {
    // Simple hash for privacy - in production use proper hashing
    return email.substring(0, 3) + '...' + email.split('@')[1];
  }

  static async calculateBadgeProgress(userId, badge) {
    try {
      const { criteria_type, criteria_value } = badge;
      let currentValue = 0;

      switch (criteria_type) {
        case 'courses_completed':
          currentValue = await Enrollment.count({
            where: {
              user_id: userId,
              status: 'completed'
            }
          });
          break;

        case 'quiz_score':
          const latestAttempt = await QuizAttempt.findOne({
            where: { user_id: userId },
            order: [['submitted_at', 'DESC']],
            attributes: ['score']
          });
          currentValue = latestAttempt ? Math.round(latestAttempt.score) : 0;
          break;

        case 'streak_days':
          const streak = await LearningStreak.findOne({
            where: { user_id: userId },
            attributes: ['current_streak_days']
          });
          currentValue = streak ? streak.current_streak_days : 0;
          break;

        case 'assignments_submitted':
          currentValue = await AssignmentSubmission.count({
            where: { user_id: userId }
          });
          break;

        case 'discussions_participated':
          currentValue = await DiscussionComment.count({
            where: { user_id: userId }
          });
          break;

        case 'courses_passed':
          currentValue = await Enrollment.count({
            where: {
              user_id: userId,
              certificate_id: { [Op.not]: null }
            }
          });
          break;

        case 'total_points':
          const userPoints = await UserPoint.findOne({
            where: { user_id: userId },
            attributes: ['total_points']
          });
          currentValue = userPoints ? userPoints.total_points : 0;
          break;

        case 'time_spent':
          const lessonCompletions = await LessonCompletion.findAll({
            where: { user_id: userId },
            attributes: ['time_spent_seconds']
          });
          const totalSeconds = lessonCompletions.reduce((sum, lc) => sum + (lc.time_spent_seconds || 0), 0);
          currentValue = Math.floor(totalSeconds / 60);
          break;

        case 'lessons_completed':
          currentValue = await LessonCompletion.count({
            where: { user_id: userId }
          });
          break;

        case 'perfect_quizzes':
          currentValue = await QuizAttempt.count({
            where: {
              user_id: userId,
              score: 100,
              passed: true
            }
          });
          break;

        default:
          currentValue = 0;
      }

      const percentage = Math.min(Math.round((currentValue / criteria_value) * 100), 100);
      const remaining = Math.max(criteria_value - currentValue, 0);

      return {
        currentValue,
        criteriaValue: criteria_value,
        percentage,
        remaining
      };
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return {
        currentValue: 0,
        criteriaValue: badge.criteria_value,
        percentage: 0,
        remaining: badge.criteria_value
      };
    }
  }

  static async awardBadgeToUser(userId, badgeId) {
    const transaction = await sequelize.transaction();
    
    try {
      const badge = await Badge.findOne({
        where: { id: badgeId, is_active: true },
        transaction
      });

      if (!badge) {
        throw new Error('Badge not found or inactive');
      }

      const alreadyEarned = await this.checkBadgeEarned(userId, badgeId);
      if (alreadyEarned) {
        throw new Error('User already earned this badge');
      }

      // Create UserBadge record
      const userBadge = await UserBadge.create({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date(),
        total_points_from_badge: badge.points_awarded
      }, { transaction });

      // Award points
      let pointsResult = { pointsAwarded: 0 };
      if (badge.points_awarded > 0) {
        pointsResult = await PointsService.addPointsToUser(
          userId,
          badge.points_awarded,
          'badge_earned',
          'Badge',
          badgeId
        );
      }

      // Create points history entry
      await PointsService.createPointsHistoryEntry(
        userId,
        badge.points_awarded,
        'badge_earned',
        'Badge',
        badgeId,
        1.0,
        `Earned badge: ${badge.name}`,
        transaction
      );

      // Create notification
      await this.createBadgeNotification(userId, badge, transaction);

      await transaction.commit();

      // Invalidate user badge cache and leaderboard cache
      await CacheManager.invalidateUserCache(userId);
      await CacheManager.invalidateLeaderboardCache();

      return {
        userBadge,
        pointsAwarded: pointsResult.pointsAwarded,
        totalPoints: pointsResult.totalPoints
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error awarding badge to user:', error);
      throw error;
    }
  }

  static async checkBadgeEarned(userId, badgeId) {
    try {
      const userBadge = await UserBadge.findOne({
        where: {
          user_id: userId,
          badge_id: badgeId
        }
      });
      return !!userBadge;
    } catch (error) {
      console.error('Error checking if badge earned:', error);
      return false;
    }
  }

  static async getBadgesByCategory(categoryId) {
    try {
      const category = await BadgeCategory.findOne({
        where: { id: categoryId }
      });

      if (!category) {
        return null;
      }

      const badges = await Badge.findAll({
        where: {
          category_id: categoryId,
          is_active: true
        },
        include: [
          {
            model: BadgeCategory,
            as: 'category'
          }
        ],
        order: [['difficulty_level', 'ASC']]
      });

      const formattedBadges = await Promise.all(
        badges.map(async (badge) => {
          const userCount = await UserBadge.count({
            where: { badge_id: badge.id }
          });

          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url,
            criteria_type: badge.criteria_type,
            criteria_value: badge.criteria_value,
            points_awarded: badge.points_awarded,
            difficulty_level: badge.difficulty_level,
            users_earned: userCount
          };
        })
      );

      return {
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
          icon_color: category.icon_color
        },
        badges: formattedBadges,
        count: formattedBadges.length
      };
    } catch (error) {
      console.error('Error getting badges by category:', error);
      throw error;
    }
  }

  static async createBadgeNotification(userId, badge, transaction = null) {
    try {
      const notification = await NotificationService.createNotification(
        userId,
        'badge_earned',
        'Badge Earned!',
        `Congratulations! You've earned the "${badge.name}" badge and ${badge.points_awarded} points!`,
        'Badge',
        badge.id,
        `/badges/${badge.id}`
      );

      return notification;
    } catch (error) {
      console.error('Error creating badge notification:', error);
      // Don't throw error as this is optional
      return null;
    }
  }
}

module.exports = BadgeService;