const { getRedisClient } = require('../config/redis');

/**
 * Cache TTL Constants (in seconds)
 */
const CACHE_TTL = {
  COURSES_LIST: 30 * 60,        // 30 minutes
  COURSE_DETAILS: 30 * 60,      // 30 minutes
  USER_ENROLLMENTS: 15 * 60,    // 15 minutes
  USER_PROFILE: 20 * 60,        // 20 minutes
  LEADERBOARD: 60 * 60,         // 1 hour
  QUIZ_QUESTIONS: 60 * 60,      // 60 minutes
  BADGES: 30 * 60,              // 30 minutes
  ACHIEVEMENTS: 30 * 60         // 30 minutes
};

/**
 * Cache key patterns for organized invalidation
 */
const CACHE_KEYS = {
  COURSES_LIST: (page, limit, search) => `courses:page:${page}:limit:${limit}:search:${search || 'all'}`,
  COURSE_DETAILS: (courseId) => `course:${courseId}:details`,
  USER_ENROLLMENTS: (userId) => `user:${userId}:enrollments`,
  USER_PROFILE: (userId) => `user:${userId}:profile`,
  LEADERBOARD: (scope, period) => `leaderboard:${scope || 'global'}:${period}`,
  QUIZ_QUESTIONS: (quizId) => `quiz:${quizId}:questions`,
  USER_BADGES: (userId) => `user:${userId}:badges`,
  USER_ACHIEVEMENTS: (userId) => `user:${userId}:achievements`
};

class CacheManager {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>}
   */
  static async get(key) {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️  Redis not available, cache miss');
        }
        return null;
      }

      const data = await redis.get(key);
      
      if (data) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Cache HIT: ${key}`);
        }
        return JSON.parse(data);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Cache MISS: ${key}`);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>}
   */
  static async set(key, value, ttl = 300) {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        return false;
      }

      await redis.setEx(key, ttl, JSON.stringify(value));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete a specific cache key
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>}
   */
  static async delete(key) {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        return false;
      }

      await redis.del(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️  Cache DELETE: ${key}`);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate all keys matching a pattern
   * @param {string} pattern - Redis key pattern (e.g., 'course:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  static async invalidatePattern(pattern) {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        return 0;
      }

      const keys = [];
      for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await redis.del(keys);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗑️  Cache INVALIDATE PATTERN: ${pattern} (${keys.length} keys deleted)`);
        }
      }

      return keys.length;
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  /**
   * Invalidate all user-related caches
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  static async invalidateUserCache(userId) {
    await this.invalidatePattern(`user:${userId}:*`);
  }

  /**
   * Invalidate all course-related caches
   * @param {string|null} courseId - If null, invalidates all course caches
   * @returns {Promise<void>}
   */
  static async invalidateCourseCache(courseId = null) {
    if (courseId) {
      await this.invalidatePattern(`course:${courseId}:*`);
    }
    // Invalidate course lists (all pages)
    await this.invalidatePattern('courses:page:*');
  }

  /**
   * Invalidate all leaderboard caches
   * @returns {Promise<void>}
   */
  static async invalidateLeaderboardCache() {
    await this.invalidatePattern('leaderboard:*');
  }

  /**
   * Invalidate quiz caches
   * @param {string} quizId 
   * @returns {Promise<void>}
   */
  static async invalidateQuizCache(quizId) {
    await this.invalidatePattern(`quiz:${quizId}:*`);
  }

  /**
   * Invalidate enrollment caches for a user and course
   * @param {string} userId 
   * @param {string} courseId 
   * @returns {Promise<void>}
   */
  static async invalidateEnrollmentCache(userId, courseId) {
    await this.invalidateUserCache(userId);
    await this.invalidateCourseCache(courseId);
  }

  /**
   * Clear all caches (use with caution)
   * @returns {Promise<void>}
   */
  static async clearAll() {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        return;
      }

      await redis.flushDb();
      console.log('🗑️  All caches cleared');
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics (useful for monitoring)
   * @returns {Promise<Object>}
   */
  static async getStats() {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.isOpen) {
        return { available: false };
      }

      const info = await redis.info('stats');
      const dbSize = await redis.dbSize();

      return {
        available: true,
        keys: dbSize,
        stats: info
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { available: false, error: error.message };
    }
  }
}

module.exports = {
  CacheManager,
  CACHE_TTL,
  CACHE_KEYS
};
