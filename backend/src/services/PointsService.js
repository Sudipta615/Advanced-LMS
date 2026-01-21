const { User, UserPoint, PointsHistory, sequelize, Quiz, QuizAttempt } = require('../models');
const NotificationService = require('./NotificationService');
const { Op } = require('sequelize');

class PointsService {
  /**
   * Award points for completing a quiz
   * @param {Object} quizAttempt 
   * @returns {Promise<Object>}
   */
  static async awardPointsForQuizCompletion(quizAttempt) {
    const pointsAwarded = this.calculateQuizPoints(quizAttempt.score);
    return await this.addPointsToUser(
      quizAttempt.user_id,
      pointsAwarded,
      'quiz_completed',
      'QuizAttempt',
      quizAttempt.id
    );
  }

  /**
   * Award points for completing an assignment
   * @param {Object} submission 
   * @param {number} score 
   * @returns {Promise<Object>}
   */
  static async awardPointsForAssignmentCompletion(submission, score) {
    const pointsAwarded = this.calculateAssignmentPoints(score);
    return await this.addPointsToUser(
      submission.user_id,
      pointsAwarded,
      'assignment_submitted',
      'AssignmentSubmission',
      submission.id
    );
  }

  /**
   * Award points for completing a course
   * @param {Object} enrollment 
   * @returns {Promise<Object>}
   */
  static async awardPointsForCourseCompletion(enrollment) {
    let pointsAwarded = 100;
    const bonuses = [];

    // Bonus: +50 if completed within 1 week (enrollment.created_at to completed_at)
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const enrollmentDate = new Date(enrollment.created_at);
    const completionDate = enrollment.completed_at ? new Date(enrollment.completed_at) : new Date();
    
    if (completionDate - enrollmentDate <= oneWeekInMs) {
      pointsAwarded += 50;
      bonuses.push('fast_completion');
    }

    // Bonus: +50 if all quizzes in course are perfect (100%)
    try {
      const courseQuizzes = await Quiz.findAll({
        where: { course_id: enrollment.course_id },
        attributes: ['id']
      });
      
      if (courseQuizzes.length > 0) {
        const quizIds = courseQuizzes.map(q => q.id);
        const perfectAttempts = await QuizAttempt.findAll({
          where: {
            user_id: enrollment.user_id,
            quiz_id: { [Op.in]: quizIds },
            score: 100
          },
          attributes: ['quiz_id']
        });
        
        const perfectQuizIds = new Set(perfectAttempts.map(a => a.quiz_id));
        if (perfectQuizIds.size === quizIds.length) {
          pointsAwarded += 50;
          bonuses.push('perfect_quizzes');
        }
      }
    } catch (error) {
      console.error('Error checking for perfect quizzes bonus:', error);
    }

    const result = await this.addPointsToUser(
      enrollment.user_id,
      pointsAwarded,
      'course_completed',
      'Course',
      enrollment.course_id
    );

    return { ...result, bonuses };
  }

  /**
   * Award points for discussion participation
   * @param {Object} comment 
   * @returns {Promise<Object>}
   */
  static async awardPointsForDiscussionParticipation(comment) {
    // Base: 5 points per comment
    // Like received: +2 points per like (one time per liker)
    // Answer marked as solution: +10 points
    
    // In a real scenario, this would be called by different triggers.
    // For this implementation, we'll award the base points.
    // Additional logic for likes/solution would typically be triggered separately.
    let pointsAwarded = 5;
    
    // If it's already marked as answer when this is called
    if (comment.is_marked_as_answer) {
      pointsAwarded += 10;
    }

    return await this.addPointsToUser(
      comment.user_id,
      pointsAwarded,
      'discussion_participated',
      'DiscussionComment',
      comment.id
    );
  }

  /**
   * Award points for lesson completion
   * @param {Object} lessonCompletion 
   * @param {number} duration 
   * @returns {Promise<Object>}
   */
  static async awardPointsForLessonCompletion(lessonCompletion, duration) {
    let pointsAwarded = 5; // Base
    const timeBonus = Math.floor(duration / 5);
    pointsAwarded += Math.min(10, timeBonus);
    
    // Total max: 15 points per lesson
    pointsAwarded = Math.min(15, pointsAwarded);

    return await this.addPointsToUser(
      lessonCompletion.user_id,
      pointsAwarded,
      'lesson_completed',
      'Lesson',
      lessonCompletion.lesson_id
    );
  }

  /**
   * Award daily login bonus
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async awardDailyLoginBonus(userId) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const alreadyAwarded = await PointsHistory.findOne({
      where: {
        user_id: userId,
        activity_type: 'daily_login',
        created_at: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });

    if (alreadyAwarded) {
      return { pointsAwarded: 0, alreadyAwarded: true };
    }

    const result = await this.addPointsToUser(
      userId,
      2,
      'daily_login'
    );

    return { ...result, alreadyAwarded: false };
  }

  /**
   * Award streak bonus
   * @param {string} userId 
   * @param {number} streakDays 
   * @returns {Promise<Object>}
   */
  static async awardStreakBonus(userId, streakDays) {
    let pointsAwarded = 0;
    let milestone = null;

    if (streakDays === 7) {
      pointsAwarded = 50;
      milestone = 7;
    } else if (streakDays === 14) {
      pointsAwarded = 100;
      milestone = 14;
    } else if (streakDays === 30) {
      pointsAwarded = 250;
      milestone = 30;
    }

    if (pointsAwarded > 0) {
      const result = await this.addPointsToUser(
        userId,
        pointsAwarded,
        'streak_bonus',
        null,
        null,
        1.0
      );
      return { ...result, milestone };
    }

    return { pointsAwarded: 0, milestone: null };
  }

  /**
   * Get points history for a user
   * @param {string} userId 
   * @param {number} limit 
   * @param {number} offset 
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  static async getPointsHistory(userId, limit = 20, offset = 0, filters = {}) {
    const where = { user_id: userId };
    
    if (filters.activityType) {
      where.activity_type = filters.activityType;
    }
    
    if (filters.resourceType) {
      where.resource_type = filters.resourceType;
    }

    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      where.created_at = {
        [Op.between]: [new Date(filters.dateRange.start), new Date(filters.dateRange.end)]
      };
    }

    const { count, rows } = await PointsHistory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      history: rows,
      total: count,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    };
  }

  /**
   * Get complete user points record
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async getUserPoints(userId) {
    let userPoints = await UserPoint.findOne({
      where: { user_id: userId }
    });

    if (!userPoints) {
      userPoints = await UserPoint.create({
        user_id: userId,
        total_points: 0,
        course_completion_points: 0,
        quiz_points: 0,
        assignment_points: 0,
        discussion_points: 0,
        streak_bonus_points: 0
      });
    }

    return userPoints;
  }

  /**
   * Helper method to add points to user
   * @param {string} userId 
   * @param {number} points 
   * @param {string} activityType 
   * @param {string} resourceType 
   * @param {string} resourceId 
   * @param {number} multiplier 
   * @returns {Promise<Object>}
   */
  static async addPointsToUser(userId, points, activityType, resourceType = null, resourceId = null, multiplier = 1.0) {
    if (points <= 0) return { pointsAwarded: 0 };

    const finalPoints = Math.round(points * multiplier);

    const transaction = await sequelize.transaction();
    try {
      const [userPoint, created] = await UserPoint.findOrCreate({
        where: { user_id: userId },
        defaults: {
          total_points: 0,
          course_completion_points: 0,
          quiz_points: 0,
          assignment_points: 0,
          discussion_points: 0,
          streak_bonus_points: 0,
          points_history_count: 0
        },
        transaction
      });

      const updateData = {
        total_points: userPoint.total_points + finalPoints,
        last_points_update: new Date(),
        points_history_count: userPoint.points_history_count + 1
      };

      // Map activity types to specific point columns
      switch (activityType) {
        case 'quiz_completed':
          updateData.quiz_points = userPoint.quiz_points + finalPoints;
          break;
        case 'assignment_submitted':
          updateData.assignment_points = userPoint.assignment_points + finalPoints;
          break;
        case 'course_completed':
          updateData.course_completion_points = userPoint.course_completion_points + finalPoints;
          break;
        case 'discussion_participated':
          updateData.discussion_points = userPoint.discussion_points + finalPoints;
          break;
        case 'streak_bonus':
          updateData.streak_bonus_points = userPoint.streak_bonus_points + finalPoints;
          break;
      }

      await userPoint.update(updateData, { transaction });

      await this.createPointsHistoryEntry(
        userId,
        finalPoints,
        activityType,
        resourceType,
        resourceId,
        multiplier,
        `Points earned for ${activityType.replace(/_/g, ' ')}`,
        transaction
      );

      await transaction.commit();

      // Emit notification (optional, after transaction)
      try {
        await NotificationService.createNotification(
          userId,
          'points_awarded',
          'Points Earned!',
          `You've earned ${finalPoints} points for ${activityType.replace(/_/g, ' ')}!`,
          resourceType,
          resourceId
        );
      } catch (notifyError) {
        console.error('Error sending points notification:', notifyError);
      }

      return {
        pointsAwarded: finalPoints,
        totalPoints: updateData.total_points
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error adding points to user:', error);
      throw error;
    }
  }

  /**
   * Helper to create points history entry
   * @returns {Promise<Object>}
   */
  static async createPointsHistoryEntry(userId, pointsEarned, activityType, resourceType, resourceId, multiplier, description, transaction = null) {
    return await PointsHistory.create({
      user_id: userId,
      points_earned: pointsEarned,
      activity_type: activityType,
      resource_type: resourceType,
      resource_id: resourceId,
      multiplier: multiplier,
      description: description,
      created_at: new Date()
    }, { transaction });
  }

  /**
   * Helper to calculate quiz points
   * @param {number} score 
   * @returns {number}
   */
  static calculateQuizPoints(score) {
    const numScore = Number(score);
    if (numScore === 100) return 25;
    return 10 + Math.round(numScore / 10);
  }

  /**
   * Helper to calculate assignment points
   * @param {number} score 
   * @returns {number}
   */
  static calculateAssignmentPoints(score) {
    const numScore = Number(score);
    if (numScore >= 90) return 30;
    return 15 + Math.round(numScore / 10);
  }
}

module.exports = PointsService;
