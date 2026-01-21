const { LearningStreak, User, PointsHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const PointsService = require('./PointsService');
const NotificationService = require('./NotificationService');

class StreakService {
  /**
   * Update user's learning streak based on activity
   * @param {string} userId 
   * @param {Date|null} activityDate 
   * @returns {Promise<Object>}
   */
  static async updateStreak(userId, activityDate = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // Use today if no date provided
      const today = activityDate ? new Date(activityDate) : new Date();
      const todayDateOnly = this.startOfDay(today);
      
      // Get or create LearningStreak record
      let [streak, created] = await LearningStreak.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          current_streak_days: 0,
          longest_streak_days: 0,
          last_activity_date: null,
          streak_started_at: null
        },
        transaction
      });

      let newMilestone = false;
      let milestoneReached = null;

      // First activity ever
      if (!streak.last_activity_date) {
        streak.current_streak_days = 1;
        streak.longest_streak_days = 1;
        streak.last_activity_date = todayDateOnly;
        streak.streak_started_at = new Date();
      } else {
        const lastActivityDate = this.startOfDay(new Date(streak.last_activity_date));
        const daysDiff = this.daysBetween(lastActivityDate, todayDateOnly);

        // Already counted today - return early
        if (daysDiff === 0) {
          await transaction.commit();
          return {
            currentStreak: streak.current_streak_days,
            longestStreak: streak.longest_streak_days,
            newMilestone: false
          };
        }

        // Activity yesterday - increment streak
        if (daysDiff === 1) {
          streak.current_streak_days += 1;
          streak.last_activity_date = todayDateOnly;
          
          // Update longest streak if needed
          if (streak.current_streak_days > streak.longest_streak_days) {
            streak.longest_streak_days = streak.current_streak_days;
          }
        } 
        // Gap > 1 day - reset streak
        else if (daysDiff > 1) {
          streak.current_streak_days = 1;
          streak.last_activity_date = todayDateOnly;
          streak.streak_started_at = new Date();
        }
      }

      await streak.save({ transaction });

      // Check for milestone and award bonus
      const currentStreak = streak.current_streak_days;
      if (currentStreak === 7 || currentStreak === 14 || currentStreak === 30) {
        // Check if we already awarded this milestone
        const alreadyAwarded = await this.checkMilestoneAwarded(userId, currentStreak, transaction);
        
        if (!alreadyAwarded) {
          const bonusResult = await PointsService.awardStreakBonus(userId, currentStreak);
          
          if (bonusResult.pointsAwarded > 0) {
            newMilestone = true;
            milestoneReached = currentStreak;

            // Create notification
            await this.createStreakNotification(
              userId,
              'milestone_reached',
              {
                milestone: currentStreak,
                pointsAwarded: bonusResult.pointsAwarded
              }
            );
          }
        }
      }

      await transaction.commit();

      return {
        currentStreak: streak.current_streak_days,
        longestStreak: streak.longest_streak_days,
        newMilestone,
        milestoneReached
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Get detailed streak information for a user
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async getStreakInfo(userId) {
    try {
      const streak = await LearningStreak.findOne({
        where: { user_id: userId }
      });

      if (!streak || !streak.last_activity_date) {
        return {
          currentStreakDays: 0,
          longestStreakDays: streak ? streak.longest_streak_days : 0,
          lastActivityDate: null,
          streakStartedAt: null,
          nextMilestone: 7,
          daysUntilNextMilestone: 7,
          daysInactive: null
        };
      }

      const currentStreak = streak.current_streak_days;
      let nextMilestone = 7;
      let daysUntilNextMilestone = 7 - currentStreak;

      if (currentStreak >= 30) {
        nextMilestone = null;
        daysUntilNextMilestone = null;
      } else if (currentStreak >= 14) {
        nextMilestone = 30;
        daysUntilNextMilestone = 30 - currentStreak;
      } else if (currentStreak >= 7) {
        nextMilestone = 14;
        daysUntilNextMilestone = 14 - currentStreak;
      }

      // Calculate days inactive
      const lastActivityDate = this.startOfDay(new Date(streak.last_activity_date));
      const today = this.startOfDay(new Date());
      const daysInactive = this.daysBetween(lastActivityDate, today);

      return {
        currentStreakDays: streak.current_streak_days,
        longestStreakDays: streak.longest_streak_days,
        lastActivityDate: streak.last_activity_date,
        streakStartedAt: streak.streak_started_at,
        nextMilestone,
        daysUntilNextMilestone,
        daysInactive
      };
    } catch (error) {
      console.error('Error getting streak info:', error);
      throw error;
    }
  }

  /**
   * Get streak history with calendar data
   * @param {string} userId 
   * @param {number} days 
   * @returns {Promise<Object>}
   */
  static async getStreakHistory(userId, days = 30) {
    try {
      const endDate = this.startOfDay(new Date());
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days + 1);

      // Get points history for the period
      const pointsHistory = await PointsHistory.findAll({
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        order: [['created_at', 'ASC']]
      });

      // Build calendar array
      const calendar = [];
      let activeDays = 0;
      let totalPoints = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = this.formatDateOnly(date);

        // Get activities for this day
        const dayActivities = pointsHistory.filter(ph => {
          const phDate = this.formatDateOnly(new Date(ph.created_at));
          return phDate === dateStr;
        });

        const pointsEarned = dayActivities.reduce((sum, ph) => sum + ph.points_earned, 0);
        const activityCount = dayActivities.length;
        const hasActivity = activityCount > 0;

        if (hasActivity) {
          activeDays++;
          totalPoints += pointsEarned;
        }

        // Determine activity level
        let level = 'none';
        if (activityCount > 0) {
          if (activityCount >= 10) level = 'high';
          else if (activityCount >= 5) level = 'medium';
          else level = 'low';
        }

        calendar.push({
          date: dateStr,
          hasActivity,
          pointsEarned,
          activityCount,
          level
        });
      }

      return {
        calendar,
        totalDays: days,
        activeDays,
        totalPoints
      };
    } catch (error) {
      console.error('Error getting streak history:', error);
      throw error;
    }
  }

  /**
   * Get streak calendar data formatted for heatmap display
   * @param {string} userId 
   * @param {number} days 
   * @returns {Promise<Array>}
   */
  static async getStreakCalendarData(userId, days = 30) {
    try {
      const history = await this.getStreakHistory(userId, days);
      
      return history.calendar.map(day => {
        let intensity = 0;
        if (day.level === 'low') intensity = 1;
        else if (day.level === 'medium') intensity = 2;
        else if (day.level === 'high') intensity = 3;
        
        // Optional: if points are really high, max intensity
        if (day.pointsEarned >= 100) intensity = 4;
        else if (day.pointsEarned >= 50 && intensity < 3) intensity = 3;

        return {
          date: day.date,
          intensity,
          count: day.activityCount
        };
      });
    } catch (error) {
      console.error('Error getting streak calendar data:', error);
      throw error;
    }
  }

  /**
   * Check if user's streak is at risk
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async checkStreakStatus(userId) {
    try {
      const streakInfo = await this.getStreakInfo(userId);
      
      if (streakInfo.currentStreakDays === 0) {
        return {
          isAtRisk: false,
          daysUntilReset: 0,
          needsActivityToday: false
        };
      }

      const daysInactive = streakInfo.daysInactive;
      const isAtRisk = daysInactive >= 1;
      const needsActivityToday = daysInactive === 0; // Actually, if 0 means today already had activity
      
      // If last activity was yesterday or before, streak needs activity today
      const needsActivity = daysInactive >= 1;
      const daysUntilReset = daysInactive >= 1 ? (2 - daysInactive) : 1;

      return {
        isAtRisk: daysInactive >= 1,
        daysUntilReset: daysInactive >= 2 ? 0 : (2 - daysInactive), // 2 days gap resets
        needsActivityToday: daysInactive >= 1
      };
    } catch (error) {
      console.error('Error checking streak status:', error);
      throw error;
    }
  }

  /**
   * Get information about next milestone
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async getNextMilestoneInfo(userId) {
    try {
      const streakInfo = await this.getStreakInfo(userId);
      const currentStreak = streakInfo.currentStreakDays;

      let milestone = 7;
      let pointsReward = 50;

      if (currentStreak >= 30) {
        return {
          milestone: null,
          daysRemaining: null,
          pointsReward: null,
          percentage: 100
        };
      } else if (currentStreak >= 14) {
        milestone = 30;
        pointsReward = 250;
      } else if (currentStreak >= 7) {
        milestone = 14;
        pointsReward = 100;
      }

      const daysRemaining = milestone - currentStreak;
      const percentage = Math.min(100, Math.round((currentStreak / milestone) * 100));

      return {
        milestone,
        daysRemaining,
        pointsReward,
        percentage
      };
    } catch (error) {
      console.error('Error getting next milestone info:', error);
      throw error;
    }
  }

  /**
   * Get history of achieved milestones
   * @param {string} userId 
   * @returns {Promise<Array>}
   */
  static async getMilestoneHistory(userId) {
    try {
      const milestones = await PointsHistory.findAll({
        where: {
          user_id: userId,
          activity_type: 'streak_bonus'
        },
        order: [['created_at', 'DESC']]
      });

      return milestones.map(m => {
        let milestone = null;
        if (m.points_earned === 50) milestone = 7;
        else if (m.points_earned === 100) milestone = 14;
        else if (m.points_earned === 250) milestone = 30;

        return {
          milestone,
          achievedAt: m.created_at,
          pointsAwarded: m.points_earned
        };
      });
    } catch (error) {
      console.error('Error getting milestone history:', error);
      throw error;
    }
  }

  /**
   * Reset a user's streak (admin function)
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async resetStreak(userId) {
    try {
      const streak = await LearningStreak.findOne({
        where: { user_id: userId }
      });

      if (!streak) {
        return null;
      }

      streak.current_streak_days = 0;
      streak.last_activity_date = null;
      streak.streak_started_at = null;
      // Keep longest_streak_days unchanged

      await streak.save();

      return streak;
    } catch (error) {
      console.error('Error resetting streak:', error);
      throw error;
    }
  }

  /**
   * Record activity and update streak
   * @param {string} userId 
   * @param {Date|null} activityDate 
   * @param {string|null} activityType 
   * @returns {Promise<Object>}
   */
  static async recordActivity(userId, activityDate = null, activityType = null) {
    try {
      // Get previous streak info to check for comeback
      const previousInfo = await this.getStreakInfo(userId);
      const wasReset = previousInfo.currentStreakDays === 0 && previousInfo.longestStreakDays > 0;

      // Update streak
      const result = await this.updateStreak(userId, activityDate);

      // Check for comeback learner (had streak before, was reset, now starting again)
      if (wasReset && result.currentStreak === 1) {
        await this.createStreakNotification(userId, 'comeback', {
          previousLongest: previousInfo.longestStreakDays
        });
      }

      return result;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  }

  /**
   * Get users by streak milestone
   * @param {number} milestone 
   * @returns {Promise<Array>}
   */
  static async getStreaksByMilestone(milestone) {
    try {
      const streaks = await LearningStreak.findAll({
        where: {
          current_streak_days: {
            [Op.gte]: milestone
          }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'first_name', 'last_name']
          }
        ],
        order: [['current_streak_days', 'DESC']]
      });

      return streaks.map(s => ({
        userId: s.user_id,
        username: s.user.username,
        currentStreak: s.current_streak_days,
        longestStreak: s.longest_streak_days
      }));
    } catch (error) {
      console.error('Error getting streaks by milestone:', error);
      throw error;
    }
  }

  /**
   * Get user's streak rank
   * @param {string} userId 
   * @param {number} milestone 
   * @returns {Promise<Object>}
   */
  static async getUserStreakRank(userId, milestone = 30) {
    try {
      const userStreak = await LearningStreak.findOne({
        where: { user_id: userId }
      });

      if (!userStreak) {
        return {
          userRank: null,
          totalWithMilestone: 0,
          userStreak: 0
        };
      }

      // Get all users with streak >= milestone, ordered by streak
      const rankedStreaks = await LearningStreak.findAll({
        where: {
          current_streak_days: {
            [Op.gte]: milestone
          }
        },
        order: [['current_streak_days', 'DESC']],
        attributes: ['user_id', 'current_streak_days']
      });

      const totalWithMilestone = rankedStreaks.length;
      const userRank = rankedStreaks.findIndex(s => s.user_id === userId) + 1;

      return {
        userRank: userRank > 0 ? userRank : null,
        totalWithMilestone,
        userStreak: userStreak.current_streak_days
      };
    } catch (error) {
      console.error('Error getting user streak rank:', error);
      throw error;
    }
  }

  /**
   * Get streak notification if user needs one
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  static async getStreakNotification(userId) {
    try {
      const streakInfo = await this.getStreakInfo(userId);
      const status = await this.checkStreakStatus(userId);

      // No active streak
      if (streakInfo.currentStreakDays === 0) {
        return null;
      }

      // Streak about to reset
      if (status.daysUntilReset === 1 && status.needsActivityToday) {
        return {
          type: 'streak_reminder',
          message: `Don't lose your ${streakInfo.currentStreakDays}-day streak! Complete an activity today.`,
          urgency: 'high',
          streakDays: streakInfo.currentStreakDays
        };
      }

      // Close to milestone
      if (streakInfo.daysUntilNextMilestone <= 3 && streakInfo.daysUntilNextMilestone > 0) {
        return {
          type: 'milestone_approaching',
          message: `Just ${streakInfo.daysUntilNextMilestone} more days to reach a ${streakInfo.nextMilestone}-day milestone!`,
          urgency: 'medium',
          daysRemaining: streakInfo.daysUntilNextMilestone
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting streak notification:', error);
      throw error;
    }
  }

  /**
   * Create streak notification
   * @param {string} userId 
   * @param {string} notificationType 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async createStreakNotification(userId, notificationType, data) {
    try {
      let title = '';
      let message = '';
      let type = 'announcement'; // Using 'announcement' as valid ENUM type for gamification

      switch (notificationType) {
        case 'milestone_reached':
          title = `🔥 ${data.milestone}-Day Streak!`;
          message = `Amazing! You've reached a ${data.milestone}-day learning streak and earned ${data.pointsAwarded} bonus points!`;
          break;

        case 'streak_reminder':
          title = '⏰ Streak Reminder';
          message = data.message || 'Complete an activity today to maintain your streak!';
          break;

        case 'streak_reset':
          title = '😔 Streak Reset';
          message = data.message || 'Your learning streak has been reset. Start a new one today!';
          break;

        case 'comeback':
          title = '👋 Welcome Back!';
          message = `Welcome back! Your previous longest streak was ${data.previousLongest} days. Let's beat that record!`;
          break;

        default:
          title = 'Streak Update';
          message = 'Your learning streak has been updated.';
      }

      return await NotificationService.createNotification(
        userId,
        type,
        title,
        message,
        'LearningStreak',
        null
      );
    } catch (error) {
      console.error('Error creating streak notification:', error);
      throw error;
    }
  }

  /**
   * Calculate streak status
   * @param {number} currentStreak 
   * @param {Date|null} lastActivityDate 
   * @returns {Object}
   */
  static calculateStreakStatus(currentStreak, lastActivityDate) {
    if (!lastActivityDate || currentStreak === 0) {
      return {
        status: 'reset',
        daysInactive: null
      };
    }

    const lastActivity = this.startOfDay(new Date(lastActivityDate));
    const today = this.startOfDay(new Date());
    const daysInactive = this.daysBetween(lastActivity, today);

    let status = 'active';
    if (daysInactive >= 2) {
      status = 'reset';
    } else if (daysInactive === 1) {
      status = 'at_risk';
    }

    return {
      status,
      daysInactive
    };
  }

  /**
   * Check if milestone was already awarded
   * @param {string} userId 
   * @param {number} milestone 
   * @param {Object} transaction 
   * @returns {Promise<boolean>}
   */
  static async checkMilestoneAwarded(userId, milestone, transaction = null) {
    // Determine points based on milestone
    let points = 0;
    if (milestone === 7) points = 50;
    else if (milestone === 14) points = 100;
    else if (milestone === 30) points = 250;

    // Check if we have a recent streak_bonus with these points
    // We check within last 2 days to avoid re-awarding on same streak
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const existing = await PointsHistory.findOne({
      where: {
        user_id: userId,
        activity_type: 'streak_bonus',
        points_earned: points,
        created_at: {
          [Op.gte]: twoDaysAgo
        }
      },
      transaction
    });

    return !!existing;
  }

  // Helper functions for date handling

  /**
   * Get start of day (midnight)
   * @param {Date} date 
   * @returns {Date}
   */
  static startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Calculate days between two dates
   * @param {Date} date1 
   * @param {Date} date2 
   * @returns {number}
   */
  static daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = date2.getTime() - date1.getTime();
    return Math.floor(diffTime / oneDay);
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date 
   * @returns {string}
   */
  static formatDateOnly(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

module.exports = StreakService;
