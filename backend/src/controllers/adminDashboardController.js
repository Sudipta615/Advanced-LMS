const { Op } = require('sequelize');
const { User, Course, Enrollment, AuditLog } = require('../models');
const { getRedisClient } = require('../config/redis');

const countActiveSessions = async () => {
  const redisClient = getRedisClient();
  if (!redisClient) return 0;

  let cursor = 0;
  let count = 0;

  do {
    const result = await redisClient.scan(cursor, {
      MATCH: 'session:*',
      COUNT: 500
    });

    cursor = Number(result.cursor);
    count += result.keys.length;
  } while (cursor !== 0);

  return count;
};

class AdminDashboardController {
  static async getOverview(req, res, next) {
    try {
      const redisClient = getRedisClient();
      const cacheKey = 'admin_dashboard:overview:v1';

      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: JSON.parse(cached) });
        }
      }

      const [totalUsers, totalCourses, totalEnrollments, activeSessions] = await Promise.all([
        User.count(),
        Course.count(),
        Enrollment.count(),
        countActiveSessions()
      ]);

      const recentActivities = await AuditLog.findAll({
        order: [['created_at', 'DESC']],
        limit: 15,
        attributes: ['id', 'user_id', 'action', 'resource_type', 'resource_id', 'created_at']
      });

      const data = {
        totals: {
          users: totalUsers,
          courses: totalCourses,
          enrollments: totalEnrollments,
          active_sessions: activeSessions
        },
        system_health: {
          uptime_seconds: Math.floor(process.uptime()),
          database: 'ok',
          redis: Boolean(redisClient)
        },
        recent_activities: recentActivities,
        revenue: {
          enabled: false,
          total: 0
        }
      };

      if (redisClient) {
        await redisClient.setEx(cacheKey, 30, JSON.stringify(data));
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const redisClient = getRedisClient();
      const cacheKey = 'admin_dashboard:stats:v1';

      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: JSON.parse(cached) });
        }
      }

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [usersLast30, totalUsers, completedEnrollments, totalEnrollments, activeSessions] = await Promise.all([
        User.count({ where: { created_at: { [Op.gte]: last30Days } } }),
        User.count(),
        Enrollment.count({ where: { status: 'completed' } }),
        Enrollment.count(),
        countActiveSessions()
      ]);

      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      const data = {
        user_growth: {
          new_users_last_30_days: usersLast30,
          total_users: totalUsers
        },
        course_completion: {
          completed_enrollments: completedEnrollments,
          total_enrollments: totalEnrollments,
          completion_rate_percent: Math.round(completionRate * 100) / 100
        },
        system: {
          uptime_seconds: Math.floor(process.uptime()),
          active_sessions: activeSessions
        },
        storage: {
          usage_mb: null
        }
      };

      if (redisClient) {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminDashboardController;
