const { Leaderboard, User, UserPoint, UserBadge, Enrollment, PointsHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getRedisClient } = require('../config/redis');

class LeaderboardService {
  /**
   * Calculate period date ranges for filtering
   * @param {string} period - 'all_time', 'monthly', 'weekly'
   * @returns {Object} Date range object
   */
  static getPeriodDates(period) {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date(now);

    switch (period) {
      case 'weekly':
        // Start of current week (Sunday)
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate.setTime(startDate.getTime() + (6 * 24 * 60 * 60 * 1000));
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'monthly':
        // Start of current month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        // End of current month
        endDate.setMonth(now.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'all_time':
      default:
        // No date restrictions for all_time
        startDate.setFullYear(2020, 0, 1); // Beginning of time
        startDate.setHours(0, 0, 0, 0);
        endDate.setFullYear(2100, 11, 31); // Far future
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Get next update timestamp for period
   * @param {string} period 
   * @returns {Date}
   */
  static getNextUpdateDate(period) {
    const now = new Date();
    const nextUpdate = new Date(now);

    switch (period) {
      case 'weekly':
        // Next Sunday at midnight
        const daysUntilSunday = 7 - now.getDay();
        if (daysUntilSunday === 0) daysUntilSunday = 7; // If today is Sunday, next week
        nextUpdate.setDate(now.getDate() + daysUntilSunday);
        nextUpdate.setHours(0, 0, 0, 0);
        break;
      
      case 'monthly':
        // First day of next month at midnight
        nextUpdate.setMonth(now.getMonth() + 1, 1);
        nextUpdate.setHours(0, 0, 0, 0);
        break;
      
      case 'all_time':
      default:
        // Monthly update for all_time
        nextUpdate.setMonth(now.getMonth() + 1, 1);
        nextUpdate.setHours(0, 0, 0, 0);
        break;
    }

    return nextUpdate;
  }

  /**
   * Periodic job - recalculate all leaderboards
   * @returns {Promise<Object>}
   */
  static async recalculateLeaderboards() {
    const transaction = await sequelize.transaction();
    let globalCount = 0;
    let courseCount = 0;

    try {
      console.log('🔄 Starting leaderboard recalculation...');

      // Calculate global leaderboards for all periods
      globalCount = await this.recalculateGlobalLeaderboard(transaction);
      
      // Calculate course-specific leaderboards
      courseCount = await this.recalculateCourseLeaderboards(transaction);

      await transaction.commit();
      console.log(`✅ Leaderboard recalculation completed: ${globalCount} global, ${courseCount} course entries`);

      return { 
        globalLeaderboards: globalCount, 
        courseLeaderboards: courseCount,
        timestamp: new Date()
      };
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error recalculating leaderboards:', error);
      throw error;
    }
  }

  /**
   * Recalculate global leaderboards for all periods
   * @param {Object} transaction 
   * @returns {Promise<number>}
   */
  static async recalculateGlobalLeaderboard(transaction = null) {
    const periods = ['all_time', 'monthly', 'weekly'];
    let totalUpdated = 0;

    for (const period of periods) {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      // Query users with activity in this period
      const userMetrics = await this.calculateUserMetrics(null, startDate, endDate, transaction);
      
      // Calculate rankings and update leaderboard
      const updated = await this.updateLeaderboardRankings(userMetrics, null, period, transaction);
      totalUpdated += updated;
    }

    return totalUpdated;
  }

  /**
   * Recalculate course-specific leaderboards
   * @param {Object} transaction 
   * @returns {Promise<number>}
   */
  static async recalculateCourseLeaderboards(transaction = null) {
    const periods = ['all_time', 'monthly', 'weekly'];
    let totalUpdated = 0;

    // Get all courses with enrollments
    const courses = await Enrollment.findAll({
      attributes: ['course_id'],
      group: ['course_id'],
      transaction
    });

    for (const course of courses) {
      const courseId = course.course_id;
      
      for (const period of periods) {
        const { startDate, endDate } = this.getPeriodDates(period);
        
        // Query users enrolled in this course with activity
        const userMetrics = await this.calculateUserMetrics(courseId, startDate, endDate, transaction);
        
        if (userMetrics.length > 0) {
          const updated = await this.updateLeaderboardRankings(userMetrics, courseId, period, transaction);
          totalUpdated += updated;
        }
      }
    }

    return totalUpdated;
  }

  /**
   * Calculate user metrics for a specific course and time period
   * @param {string|null} courseId 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {Object} transaction 
   * @returns {Promise<Array>}
   */
  static async calculateUserMetrics(courseId = null, startDate, endDate, transaction = null) {
    const whereClause = {};
    const includeClause = [
      {
        model: User,
        attributes: ['id', 'name', 'email', 'avatar_url']
      }
    ];

    // Filter by course if specified
    if (courseId) {
      whereClause.course_id = courseId;
    }

    // Get enrollments with user data
    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: includeClause,
      transaction
    });

    const userMetrics = [];

    for (const enrollment of enrollments) {
      const userId = enrollment.user_id;
      
      // Get points earned in this period
      const pointsData = await PointsHistory.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('points_earned')), 'total_points']
        ],
        where: {
          user_id: userId,
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        transaction
      });

      const totalPoints = parseInt(pointsData?.dataValues?.total_points || 0);

      // Get badges earned in this period
      const badgesData = await UserBadge.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'badges_count']
        ],
        where: {
          user_id: userId,
          earned_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        transaction
      });

      const badgesCount = parseInt(badgesData?.dataValues?.badges_count || 0);

      // Get completed courses in this period
      const completedCourses = await Enrollment.count({
        where: {
          user_id: userId,
          status: 'completed',
          completed_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        transaction
      });

      // Only include users with some activity in this period
      if (totalPoints > 0 || badgesCount > 0 || completedCourses > 0) {
        userMetrics.push({
          userId,
          user: enrollment.User,
          totalPoints,
          badgesCount,
          coursesCompleted: completedCourses,
          enrollmentDate: enrollment.created_at
        });
      }
    }

    return userMetrics;
  }

  /**
   * Update leaderboard rankings for a set of users
   * @param {Array} userMetrics 
   * @param {string|null} courseId 
   * @param {string} period 
   * @param {Object} transaction 
   * @returns {Promise<number>}
   */
  static async updateLeaderboardRankings(userMetrics, courseId = null, period, transaction = null) {
    // Sort users by: total_points DESC, badges_count DESC, enrollment_date ASC
    userMetrics.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.badgesCount !== a.badgesCount) {
        return b.badgesCount - a.badgesCount;
      }
      return new Date(a.enrollmentDate) - new Date(b.enrollmentDate);
    });

    let rank = 1;
    let previousPoints = null;
    let tiesCount = 0;
    const updatedRecords = [];

    for (let i = 0; i < userMetrics.length; i++) {
      const userMetric = userMetrics[i];
      
      // Handle ties - same rank for same points
      if (previousPoints !== null && userMetric.totalPoints === previousPoints) {
        tiesCount++;
      } else {
        rank = i + 1;
        previousPoints = userMetric.totalPoints;
        tiesCount = 0;
      }

      const leaderboardData = {
        user_id: userMetric.userId,
        course_id: courseId,
        rank,
        total_points: userMetric.totalPoints,
        badges_count: userMetric.badgesCount,
        courses_completed: userMetric.coursesCompleted,
        ranking_period: period
      };

      // Upsert leaderboard record
      const [record, created] = await Leaderboard.findOrCreate({
        where: {
          user_id: userMetric.userId,
          course_id: courseId,
          ranking_period: period
        },
        defaults: leaderboardData,
        transaction
      });

      if (!created && (
        record.rank !== rank ||
        record.total_points !== userMetric.totalPoints ||
        record.badges_count !== userMetric.badgesCount ||
        record.courses_completed !== userMetric.coursesCompleted
      )) {
        await record.update(leaderboardData, { transaction });
      }

      updatedRecords.push(record);
    }

    // Delete users no longer in the rankings
    const userIds = userMetrics.map(u => u.userId);
    await Leaderboard.destroy({
      where: {
        course_id: courseId,
        ranking_period: period,
        user_id: {
          [Op.notIn]: userIds
        }
      },
      transaction
    });

    return updatedRecords.length;
  }

  /**
   * Get leaderboard with pagination
   * @param {string|null} courseId 
   * @param {string} period 
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Object>}
   */
  static async getLeaderboard(courseId = null, period = 'all_time', limit = 10, offset = 0) {
    try {
      const where = { ranking_period: period };
      
      if (courseId) {
        where.course_id = courseId;
      } else {
        where.course_id = null;
      }

      const { count, rows } = await Leaderboard.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar_url']
          }
        ],
        order: [['rank', 'ASC']],
        limit,
        offset,
        distinct: true
      });

      const leaderboard = rows.map(row => ({
        rank: row.rank,
        user: {
          id: row.User.id,
          name: row.User.name,
          avatar: row.User.avatar_url,
          email: row.User.email
        },
        totalPoints: row.total_points,
        badgesCount: row.badges_count,
        coursesCompleted: row.courses_completed,
        earnedAt: row.updated_at
      }));

      return {
        leaderboard,
        total: count,
        period,
        courseId,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's rank and neighboring users
   * @param {string} userId 
   * @param {string|null} courseId 
   * @param {string} period 
   * @returns {Promise<Object>}
   */
  static async getUserRank(userId, courseId = null, period = 'all_time') {
    try {
      const where = {
        user_id: userId,
        ranking_period: period
      };

      if (courseId) {
        where.course_id = courseId;
      } else {
        where.course_id = null;
      }

      const userRank = await Leaderboard.findOne({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar_url']
          }
        ]
      });

      if (!userRank) {
        return {
          user: null,
          rank: null,
          totalPoints: 0,
          badgesCount: 0,
          period,
          courseId,
          neighbors: [],
          percentile: 0
        };
      }

      // Get neighboring users (3 above and 3 below)
      const neighbors = await this.getNeighborUsers(userRank.rank, courseId, period);

      // Calculate percentile
      const totalUsers = await Leaderboard.count({
        where: {
          course_id: courseId || null,
          ranking_period: period
        }
      });

      const percentile = ((totalUsers - userRank.rank) / totalUsers) * 100;

      return {
        user: {
          id: userRank.User.id,
          name: userRank.User.name,
          avatar: userRank.User.avatar_url
        },
        rank: userRank.rank,
        totalPoints: userRank.total_points,
        badgesCount: userRank.badges_count,
        period,
        courseId,
        neighbors,
        percentile: Math.round(percentile * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }
  }

  /**
   * Get neighboring users around a specific rank
   * @param {number} rank 
   * @param {string|null} courseId 
   * @param {string} period 
   * @returns {Promise<Array>}
   */
  static async getNeighborUsers(rank, courseId = null, period) {
    const where = {
      ranking_period: period
    };

    if (courseId) {
      where.course_id = courseId;
    } else {
      where.course_id = null;
    }

    const neighbors = [];

    // Get users before and after
    const startRank = Math.max(1, rank - 3);
    const endRank = rank + 3;

    const users = await Leaderboard.findAll({
      where: {
        ...where,
        rank: {
          [Op.between]: [startRank, endRank]
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar_url']
        }
      ],
      order: [['rank', 'ASC']]
    });

    return users.map(user => ({
      rank: user.rank,
      user: {
        id: user.User.id,
        name: user.User.name,
        avatar: user.User.avatar_url
      },
      points: user.total_points
    }));
  }

  /**
   * Get top N users from leaderboard
   * @param {number} limit 
   * @param {string} period 
   * @param {string|null} courseId 
   * @returns {Promise<Array>}
   */
  static async getTopUsers(limit = 10, period = 'all_time', courseId = null) {
    try {
      const where = { ranking_period: period };
      
      if (courseId) {
        where.course_id = courseId;
      } else {
        where.course_id = null;
      }

      const topUsers = await Leaderboard.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar_url']
          }
        ],
        order: [['rank', 'ASC']],
        limit
      });

      return topUsers.map(user => ({
        rank: user.rank,
        user: {
          id: user.User.id,
          name: user.User.name,
          avatar: user.User.avatar_url,
          email: user.User.email
        },
        points: user.total_points,
        badges: user.badges_count,
        courses: user.courses_completed
      }));
    } catch (error) {
      console.error('Error fetching top users:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard statistics
   * @param {string|null} courseId 
   * @param {string} period 
   * @returns {Promise<Object>}
   */
  static async getLeaderboardStats(courseId = null, period = 'all_time') {
    try {
      const where = { ranking_period: period };
      
      if (courseId) {
        where.course_id = courseId;
      } else {
        where.course_id = null;
      }

      const leaderboardData = await Leaderboard.findAll({
        where,
        attributes: [
          'total_points'
        ]
      });

      const points = leaderboardData.map(l => l.total_points);
      
      if (points.length === 0) {
        return {
          totalUsers: 0,
          averagePoints: 0,
          medianPoints: 0,
          maxPoints: 0,
          minPoints: 0,
          totalPointsDistributed: 0
        };
      }

      const totalUsers = points.length;
      const totalPointsDistributed = points.reduce((sum, p) => sum + p, 0);
      const averagePoints = totalPointsDistributed / totalUsers;
      
      // Calculate median
      const sortedPoints = [...points].sort((a, b) => a - b);
      const medianPoints = sortedPoints.length % 2 === 0
        ? (sortedPoints[sortedPoints.length / 2 - 1] + sortedPoints[sortedPoints.length / 2]) / 2
        : sortedPoints[Math.floor(sortedPoints.length / 2)];

      const maxPoints = Math.max(...points);
      const minPoints = Math.min(...sortedPoints.slice(0, Math.min(10, sortedPoints.length)));

      return {
        totalUsers,
        averagePoints: Math.round(averagePoints * 100) / 100,
        medianPoints: Math.round(medianPoints * 100) / 100,
        maxPoints,
        minPoints,
        totalPointsDistributed
      };
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      throw error;
    }
  }

  /**
   * Calculate user's percentile in leaderboard
   * @param {string} userId 
   * @param {string|null} courseId 
   * @param {string} period 
   * @returns {Promise<number>}
   */
  static async getUserPercentile(userId, courseId = null, period = 'all_time') {
    try {
      const userRank = await this.getUserRank(userId, courseId, period);
      
      if (!userRank.rank) {
        return 0;
      }

      const totalUsers = await Leaderboard.count({
        where: {
          course_id: courseId || null,
          ranking_period: period
        }
      });

      if (totalUsers === 0) return 0;

      const percentile = ((totalUsers - userRank.rank) / totalUsers) * 100;
      return Math.round(percentile * 100) / 100;
    } catch (error) {
      console.error('Error calculating user percentile:', error);
      return 0;
    }
  }

  /**
   * Get period metadata
   * @param {string} period 
   * @returns {Object}
   */
  static getLeaderboardPeriodData(period = 'all_time') {
    const { startDate, endDate } = this.getPeriodDates(period);
    const lastUpdated = new Date();
    const nextUpdate = this.getNextUpdateDate(period);

    return {
      period,
      startDate,
      endDate,
      lastUpdated,
      nextUpdate
    };
  }

  /**
   * Compare user's performance across different scopes
   * @param {string} userId 
   * @param {string|null} courseId 
   * @param {string} period 
   * @returns {Promise<Object>}
   */
  static async getLeaderboardComparison(userId, courseId = null, period = 'all_time') {
    try {
      // Get user's rank and metrics
      const userRank = await this.getUserRank(userId, courseId, period);
      const userPercentile = await this.getUserPercentile(userId, courseId, period);

      // Get course rank and metrics (if courseId provided, this is the same as userRank)
      let courseRank = null;
      let courseAverage = 0;
      let courseBadgesAverage = 0;

      if (courseId) {
        courseRank = userRank;
        const courseStats = await this.getLeaderboardStats(courseId, period);
        courseAverage = courseStats.averagePoints;
        courseBadgesAverage = courseStats.totalUsers > 0 
          ? (await Leaderboard.sum('badges_count', {
              where: {
                course_id: courseId,
                ranking_period: period
              }
            })) / courseStats.totalUsers
          : 0;
      }

      // Get global rank and metrics
      const globalRank = await this.getUserRank(userId, null, period);
      const globalStats = await this.getLeaderboardStats(null, period);
      const globalAverage = globalStats.averagePoints;
      const globalBadgesAverage = globalStats.totalUsers > 0
        ? (await Leaderboard.sum('badges_count', {
            where: {
              course_id: null,
              ranking_period: period
            }
          })) / globalStats.totalUsers
        : 0;

      return {
        userRank: {
          course: courseRank?.rank || null,
          global: globalRank?.rank || null
        },
        userPoints: {
          actual: userRank.totalPoints,
          courseAverage: courseId ? courseAverage : globalAverage,
          globalAverage,
          percentile: userPercentile
        },
        userBadges: {
          actual: userRank.badgesCount,
          courseAverage: courseId ? courseBadgesAverage : globalBadgesAverage,
          globalAverage: globalBadgesAverage
        }
      };
    } catch (error) {
      console.error('Error fetching leaderboard comparison:', error);
      throw error;
    }
  }

  /**
   * Recalculate metrics for a specific user
   * @param {string} userId 
   * @param {string|null} courseId 
   * @returns {Promise<Array>}
   */
  static async recalculateUserMetrics(userId, courseId = null) {
    const transaction = await sequelize.transaction();
    let updatedRecords = [];

    try {
      const periods = ['all_time', 'monthly', 'weekly'];

      for (const period of periods) {
        const { startDate, endDate } = this.getPeriodDates(period);
        
        // Calculate metrics for this user in this period
        const userMetrics = await this.calculateUserMetrics(
          courseId, 
          startDate, 
          endDate, 
          transaction
        );

        // Filter to specific user
        const userMetric = userMetrics.find(m => m.userId === userId);
        
        if (userMetric) {
          const updated = await this.updateLeaderboardRankings(
            [userMetric], 
            courseId, 
            period, 
            transaction
          );
          updatedRecords.push(...updated);
        } else {
          // Remove user from leaderboard if no activity
          await Leaderboard.destroy({
            where: {
              user_id: userId,
              course_id: courseId,
              ranking_period: period
            },
            transaction
          });
        }
      }

      await transaction.commit();
      return updatedRecords;
    } catch (error) {
      await transaction.rollback();
      console.error('Error recalculating user metrics:', error);
      throw error;
    }
  }

  /**
   * Get all leaderboard entries for a period
   * @param {string} period 
   * @returns {Promise<Array>}
   */
  static async getLeaderboardByPeriod(period = 'all_time') {
    try {
      const leaderboard = await Leaderboard.findAll({
        where: { 
          ranking_period: period,
          course_id: null // Global leaderboard only
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar_url']
          }
        ],
        order: [['rank', 'ASC']]
      });

      return leaderboard.map(entry => ({
        rank: entry.rank,
        user: entry.User,
        points: entry.total_points,
        badges: entry.badges_count,
        courses: entry.courses_completed
      }));
    } catch (error) {
      console.error('Error fetching leaderboard by period:', error);
      throw error;
    }
  }

  /**
   * Reset leaderboard data for a period
   * @param {string} period 
   * @param {string|null} courseId 
   * @returns {Promise<number>}
   */
  static async resetLeaderboard(period, courseId = null) {
    try {
      const where = { ranking_period: period };
      
      if (courseId) {
        where.course_id = courseId;
      } else {
        where.course_id = null;
      }

      const deletedCount = await Leaderboard.destroy({ where });
      
      console.log(`🗑️ Reset ${deletedCount} leaderboard entries for period: ${period}, course: ${courseId || 'global'}`);
      return deletedCount;
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Cache leaderboard in Redis
   * @param {string} period 
   * @param {string|null} courseId 
   * @param {number} ttl 
   * @returns {Promise<Object>}
   */
  static async cacheLeaderboard(period, courseId = null, ttl = 3600) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        console.warn('Redis not available, skipping cache');
        return null;
      }

      const leaderboardData = await this.getLeaderboard(courseId, period, 100, 0); // Cache top 100
      
      const cacheKey = `leaderboard:${period}:${courseId || 'global'}`;
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(leaderboardData));
      
      console.log(`💾 Cached leaderboard data: ${cacheKey}`);
      return leaderboardData;
    } catch (error) {
      console.error('Error caching leaderboard:', error);
      return null;
    }
  }

  /**
   * Get cached leaderboard from Redis
   * @param {string} period 
   * @param {string|null} courseId 
   * @returns {Promise<Object|null>}
   */
  static async getCachedLeaderboard(period, courseId = null) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return null;
      }

      const cacheKey = `leaderboard:${period}:${courseId || 'global'}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`📋 Cache hit for leaderboard: ${cacheKey}`);
        return JSON.parse(cachedData);
      }

      console.log(`📋 Cache miss for leaderboard: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Error getting cached leaderboard:', error);
      return null;
    }
  }
}

module.exports = LeaderboardService;