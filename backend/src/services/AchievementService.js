const { Op } = require('sequelize');

// Achievement type definitions with metadata
const ACHIEVEMENT_TYPES = {
  first_course: {
    name: 'First Course',
    description: 'Complete your first course',
    icon: '🎓',
    points: 100
  },
  first_quiz_passed: {
    name: 'Quiz Master',
    description: 'Pass your first quiz with a score of 50% or higher',
    icon: '🧠',
    points: 50
  },
  first_assignment: {
    name: 'Assignment Novice',
    description: 'Submit your first assignment',
    icon: '📝',
    points: 25
  },
  first_discussion_post: {
    name: 'Discussion Starter',
    description: 'Make your first discussion comment',
    icon: '💬',
    points: 25
  },
  weekly_goal: {
    name: 'Weekly Warrior',
    description: 'Earn 500+ points in a week',
    icon: '🎯',
    points: 200
  },
  perfect_week: {
    name: 'Perfect Week',
    description: 'Get 100% on all activities in a week',
    icon: '⭐',
    points: 300
  },
  comeback_learner: {
    name: 'Comeback Kid',
    description: 'Complete activity after 7+ days of inactivity',
    icon: '🔄',
    points: 75
  }
};

class AchievementService {
  /**
   * Dynamically load models to avoid circular dependencies
   */
  static getModels() {
    try {
      const models = require('../models');
      return {
        Achievement: models.Achievement,
        User: models.User,
        PointsHistory: models.PointsHistory,
        LearningStreak: models.LearningStreak,
        QuizAttempt: models.QuizAttempt,
        AssignmentSubmission: models.AssignmentSubmission,
        Course: models.Course,
        CourseDiscussion: models.CourseDiscussion,
        DiscussionComment: models.DiscussionComment,
        Enrollment: models.Enrollment,
        Notification: models.Notification
      };
    } catch (error) {
      console.error('Error loading models:', error);
      throw new Error('Models not available. Make sure database is properly initialized.');
    }
  }

  /**
   * Dynamically load services to avoid circular dependencies
   */
  static getServices() {
    try {
      const NotificationService = require('./NotificationService');
      return { NotificationService };
    } catch (error) {
      console.error('Error loading services:', error);
      return { NotificationService: null };
    }
  }

  /**
   * Get database sequelize instance
   */
  static getSequelize() {
    try {
      const { sequelize } = require('../config/database');
      return sequelize;
    } catch (error) {
      console.error('Error loading database config:', error);
      throw new Error('Database not available. Make sure database is properly configured.');
    }
  }

  /**
   * Main method to check and unlock achievements based on trigger events
   */
  static async checkAndUnlockAchievements(userId, triggerType, triggerData = {}) {
    const sequelize = this.getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
      let achievementsUnlocked = [];
      let pointsAwarded = 0;

      // Determine which achievements to check based on trigger type
      const achievementsToCheck = this.getAchievementsToCheck(triggerType);

      for (const achievementType of achievementsToCheck) {
        const wasUnlocked = await this.checkAndUnlockSpecificAchievement(userId, achievementType, triggerData, transaction);
        
        if (wasUnlocked) {
          achievementsUnlocked.push(achievementType);
          
          // Award bonus points for certain achievements
          if (ACHIEVEMENT_TYPES[achievementType]?.points) {
            pointsAwarded += ACHIEVEMENT_TYPES[achievementType].points;
          }
        }
      }

      await transaction.commit();

      return {
        achievementsUnlocked,
        pointsAwarded
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed their first course
   */
  static async checkFirstCourseAchievement(userId) {
    try {
      const models = this.getModels();
      const { Course, Enrollment } = models;

      // Check if user already has this achievement
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'first_course'
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Check if user has completed any courses
      const completedEnrollments = await Enrollment.findAll({
        where: { 
          user_id: userId, 
          status: 'completed' 
        },
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }]
      });

      if (completedEnrollments.length > 0) {
        const firstEnrollment = completedEnrollments[0];
        
        await this.unlockAchievement(userId, 'first_course', {
          courseId: firstEnrollment.course.id,
          courseName: firstEnrollment.course.title,
          completedAt: new Date().toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking first course achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has passed their first quiz (score >= 50)
   */
  static async checkFirstQuizAchievement(userId) {
    try {
      const models = this.getModels();
      const { QuizAttempt, Quiz } = models;

      // Check if user already has this achievement
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'first_quiz_passed'
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Check if user has passed any quiz with score >= 50
      const passedQuiz = await QuizAttempt.findOne({
        where: {
          user_id: userId,
          passed: true,
          score: { [Op.gte]: 50 }
        },
        include: [{
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title']
        }],
        order: [['submitted_at', 'ASC']]
      });

      if (passedQuiz) {
        await this.unlockAchievement(userId, 'first_quiz_passed', {
          quizId: passedQuiz.quiz_id,
          quizName: passedQuiz.quiz?.title || 'Unknown Quiz',
          score: passedQuiz.score,
          completedAt: passedQuiz.submitted_at?.toISOString() || new Date().toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking first quiz achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has submitted their first assignment
   */
  static async checkFirstAssignmentAchievement(userId) {
    try {
      const models = this.getModels();
      const { AssignmentSubmission, Assignment } = models;

      // Check if user already has this achievement
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'first_assignment'
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Check if user has submitted any assignment
      const firstSubmission = await AssignmentSubmission.findOne({
        where: {
          user_id: userId
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title']
        }],
        order: [['submitted_at', 'ASC']]
      });

      if (firstSubmission) {
        await this.unlockAchievement(userId, 'first_assignment', {
          assignmentId: firstSubmission.assignment_id,
          assignmentName: firstSubmission.assignment?.title || 'Unknown Assignment',
          submittedAt: firstSubmission.submitted_at?.toISOString() || new Date().toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking first assignment achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has made their first discussion post
   */
  static async checkFirstDiscussionAchievement(userId) {
    try {
      const models = this.getModels();
      const { DiscussionComment, CourseDiscussion } = models;

      // Check if user already has this achievement
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'first_discussion_post'
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Check if user has posted any discussion comment
      const firstPost = await DiscussionComment.findOne({
        where: {
          user_id: userId
        },
        include: [{
          model: CourseDiscussion,
          as: 'discussion',
          attributes: ['id', 'title']
        }],
        order: [['created_at', 'ASC']]
      });

      if (firstPost) {
        await this.unlockAchievement(userId, 'first_discussion_post', {
          discussionId: firstPost.discussion_id,
          discussionName: firstPost.discussion?.title || 'Unknown Discussion',
          postedAt: firstPost.created_at?.toISOString() || new Date().toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking first discussion achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has earned 500+ points in the past 7 days
   */
  static async checkWeeklyGoalAchievement(userId) {
    try {
      const models = this.getModels();
      const { PointsHistory } = models;

      // Get the start of the current week (7 days ago)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Check if user already has this achievement for this week
      const weekOf = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'weekly_goal',
          achievement_data: {
            period: { [Op.like]: `week_of_${weekOf}%` }
          }
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Sum points earned in the last 7 days
      const weeklyPoints = await PointsHistory.sum('points_earned', {
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: weekStart
          }
        }
      });

      if (weeklyPoints >= 500) {
        const weekEnd = new Date();
        
        await this.unlockAchievement(userId, 'weekly_goal', {
          pointsEarned: weeklyPoints,
          period: `week_of_${weekOf}`,
          periodStart: weekStart.toISOString(),
          periodEnd: weekEnd.toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking weekly goal achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed all activities with 100% scores in the past 7 days
   */
  static async checkPerfectWeekAchievement(userId) {
    try {
      const models = this.getModels();
      const { QuizAttempt, AssignmentSubmission } = models;

      // Get the start of the current week (7 days ago)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Check if user already has this achievement for this week
      const weekOf = weekStart.toISOString().split('T')[0];
      const existingAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'perfect_week',
          achievement_data: {
            period: { [Op.like]: `week_of_${weekOf}%` }
          }
        }
      });

      if (existingAchievement) {
        return false;
      }

      // Get all quiz attempts this week
      const quizAttempts = await QuizAttempt.findAll({
        where: {
          user_id: userId,
          submitted_at: {
            [Op.gte]: weekStart
          },
          status: 'graded'
        }
      });

      // Get all assignment submissions this week
      const assignmentSubmissions = await AssignmentSubmission.findAll({
        where: {
          user_id: userId,
          submitted_at: {
            [Op.gte]: weekStart
          }
        }
      });

      // Check if all activities have 100% score
      const allQuizzesPerfect = quizAttempts.every(attempt => parseFloat(attempt.score) === 100);
      const allAssignmentsPerfect = assignmentSubmissions.every(submission => 
        submission.score !== null && parseFloat(submission.score) === 100
      );

      // Need at least one quiz and one assignment, and all must be perfect
      if (quizAttempts.length > 0 && assignmentSubmissions.length > 0 && 
          allQuizzesPerfect && allAssignmentsPerfect) {
        
        const weekEnd = new Date();
        const totalActivities = quizAttempts.length + assignmentSubmissions.length;

        await this.unlockAchievement(userId, 'perfect_week', {
          activitiesCompleted: totalActivities,
          quizAttempts: quizAttempts.length,
          assignments: assignmentSubmissions.length,
          period: `week_of_${weekOf}`,
          periodStart: weekStart.toISOString(),
          periodEnd: weekEnd.toISOString()
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking perfect week achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user is returning after 7+ days of inactivity
   */
  static async checkComebackLearnerAchievement(userId) {
    try {
      const models = this.getModels();
      const { LearningStreak } = models;

      // Check if user already has this achievement recently
      const recentAchievement = await models.Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: 'comeback_learner',
          unlocked_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (recentAchievement) {
        return false;
      }

      // Get user's learning streak
      let streak = await LearningStreak.findOne({
        where: { user_id: userId }
      });

      if (!streak) {
        // Create initial streak record if none exists
        streak = await LearningStreak.create({
          user_id: userId,
          current_streak_days: 0,
          longest_streak_days: 0
        });
      }

      const lastActivityDate = streak.last_activity_date;
      
      if (!lastActivityDate) {
        return false; // No previous activity to compare against
      }

      const daysSinceLastActivity = Math.floor(
        (new Date() - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24)
      );

      // If it's been 7 or more days since last activity
      if (daysSinceLastActivity >= 7) {
        await this.unlockAchievement(userId, 'comeback_learner', {
          daysSinceLastActivity,
          resumedAt: new Date().toISOString(),
          streakReset: daysSinceLastActivity
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking comeback learner achievement:', error);
      throw error;
    }
  }

  /**
   * Get all unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId) {
    try {
      const models = this.getModels();
      const { Achievement, User } = models;

      const achievements = await Achievement.findAll({
        where: { user_id: userId },
        order: [['unlocked_at', 'DESC']],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }]
      });

      const achievementsWithDetails = achievements.map(achievement => ({
        id: achievement.id,
        type: achievement.achievement_type,
        unlockedAt: achievement.unlocked_at,
        data: achievement.achievement_data,
        details: ACHIEVEMENT_TYPES[achievement.achievement_type] || null
      }));

      return {
        achievements: achievementsWithDetails,
        count: achievements.length
      };
    } catch (error) {
      console.error('Error getting unlocked achievements:', error);
      throw error;
    }
  }

  /**
   * Get available achievements for a user (not yet unlocked)
   */
  static async getAvailableAchievements(userId) {
    try {
      const models = this.getModels();
      const { Achievement } = models;

      // Get user's unlocked achievements
      const unlockedTypes = await Achievement.findAll({
        where: { user_id: userId },
        attributes: ['achievement_type']
      });

      const unlockedTypeSet = new Set(unlockedTypes.map(a => a.achievement_type));

      const availableAchievements = [];

      // Calculate progress for each achievement type
      for (const [type, metadata] of Object.entries(ACHIEVEMENT_TYPES)) {
        if (unlockedTypeSet.has(type)) {
          continue; // Skip already unlocked achievements
        }

        const progress = await this.calculateAchievementProgress(userId, type);
        
        availableAchievements.push({
          type,
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
          points: metadata.points,
          progress
        });
      }

      return {
        availableAchievements,
        count: availableAchievements.length
      };
    } catch (error) {
      console.error('Error getting available achievements:', error);
      throw error;
    }
  }

  /**
   * Get all possible achievement types with details
   */
  static async getAllAchievements() {
    try {
      const achievements = Object.entries(ACHIEVEMENT_TYPES).map(([type, metadata]) => ({
        type,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        points: metadata.points
      }));

      return {
        achievements,
        count: achievements.length
      };
    } catch (error) {
      console.error('Error getting all achievements:', error);
      throw error;
    }
  }

  /**
   * Check if user already has a specific achievement
   */
  static async hasAchievement(userId, achievementType) {
    try {
      const models = this.getModels();
      const { Achievement } = models;

      const achievement = await Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: achievementType
        }
      });

      return !!achievement;
    } catch (error) {
      console.error('Error checking achievement:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific achievement type
   */
  static getAchievementDetails(achievementType) {
    try {
      const details = ACHIEVEMENT_TYPES[achievementType];
      
      if (!details) {
        throw new Error(`Unknown achievement type: ${achievementType}`);
      }

      return {
        type: achievementType,
        name: details.name,
        description: details.description,
        icon: details.icon,
        points: details.points,
        howToUnlock: this.getHowToUnlockDescription(achievementType)
      };
    } catch (error) {
      console.error('Error getting achievement details:', error);
      throw error;
    }
  }

  /**
   * Helper method to unlock an achievement
   */
  static async unlockAchievement(userId, achievementType, achievementData = {}) {
    const sequelize = this.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const models = this.getModels();
      const { Achievement } = models;
      const { NotificationService } = this.getServices();

      // Validate achievement type
      if (!ACHIEVEMENT_TYPES[achievementType]) {
        throw new Error(`Invalid achievement type: ${achievementType}`);
      }

      // Check if user already has this achievement
      const existing = await Achievement.findOne({
        where: {
          user_id: userId,
          achievement_type: achievementType
        },
        transaction
      });

      if (existing) {
        await transaction.rollback();
        return null; // Already unlocked
      }

      // Create the achievement
      const achievement = await Achievement.create({
        user_id: userId,
        achievement_type: achievementType,
        achievement_data: achievementData,
        unlocked_at: new Date()
      }, { transaction });

      // Create notification
      await this.createAchievementNotification(userId, achievement, transaction);

      // Commit the transaction
      await transaction.commit();

      console.log(`Achievement unlocked: ${achievementType} for user ${userId}`);
      
      return achievement;
    } catch (error) {
      await transaction.rollback();
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Helper method to create achievement notification
   */
  static async createAchievementNotification(userId, achievement, transaction = null) {
    try {
      const { NotificationService } = this.getServices();
      
      if (!NotificationService) {
        console.warn('NotificationService not available for achievement notification');
        return;
      }

      const achievementDetails = ACHIEVEMENT_TYPES[achievement.achievement_type];
      
      if (!achievementDetails) {
        console.warn(`No details found for achievement type: ${achievement.achievement_type}`);
        return;
      }

      await NotificationService.createNotification(
        userId,
        'achievement_unlocked',
        'Achievement Unlocked! 🎉',
        `You earned the "${achievementDetails.name}" achievement! ${achievementDetails.icon}`,
        'Achievement',
        achievement.id,
        '/dashboard/achievements'
      );
    } catch (error) {
      console.error('Error creating achievement notification:', error);
      // Don't throw error here to avoid rolling back the achievement creation
    }
  }

  /**
   * Get which achievements to check based on trigger type
   */
  static getAchievementsToCheck(triggerType) {
    const triggerMap = {
      'quiz_completed': ['first_quiz_passed', 'perfect_week', 'weekly_goal', 'comeback_learner'],
      'course_completed': ['first_course', 'perfect_week', 'weekly_goal'],
      'assignment_submitted': ['first_assignment', 'perfect_week', 'weekly_goal'],
      'discussion_participated': ['first_discussion_post', 'weekly_goal'],
      'lesson_completed': ['weekly_goal', 'perfect_week'],
      'daily_check': ['weekly_goal', 'perfect_week', 'comeback_learner'],
      'week_ended': ['weekly_goal', 'perfect_week']
    };

    return triggerMap[triggerType] || [];
  }

  /**
   * Check and unlock a specific achievement type
   */
  static async checkAndUnlockSpecificAchievement(userId, achievementType, triggerData, transaction = null) {
    try {
      let unlocked = false;

      switch (achievementType) {
        case 'first_course':
          unlocked = await this.checkFirstCourseAchievement(userId);
          break;
        case 'first_quiz_passed':
          unlocked = await this.checkFirstQuizAchievement(userId);
          break;
        case 'first_assignment':
          unlocked = await this.checkFirstAssignmentAchievement(userId);
          break;
        case 'first_discussion_post':
          unlocked = await this.checkFirstDiscussionAchievement(userId);
          break;
        case 'weekly_goal':
          unlocked = await this.checkWeeklyGoalAchievement(userId);
          break;
        case 'perfect_week':
          unlocked = await this.checkPerfectWeekAchievement(userId);
          break;
        case 'comeback_learner':
          unlocked = await this.checkComebackLearnerAchievement(userId);
          break;
        default:
          console.warn(`Unknown achievement type: ${achievementType}`);
      }

      return unlocked;
    } catch (error) {
      console.error(`Error checking ${achievementType} achievement:`, error);
      return false;
    }
  }

  /**
   * Calculate progress towards an achievement
   */
  static async calculateAchievementProgress(userId, achievementType) {
    try {
      const models = this.getModels();
      const { Enrollment, QuizAttempt, AssignmentSubmission, DiscussionComment, PointsHistory, LearningStreak, Course, Quiz, Assignment } = models;

      switch (achievementType) {
        case 'first_course': {
          const completedCourses = await Enrollment.count({
            where: { user_id: userId, status: 'completed' }
          });
          return {
            current: completedCourses,
            required: 1,
            percentage: Math.min(100, completedCourses * 100),
            description: `${completedCourses}/1 courses completed`
          };
        }

        case 'first_quiz_passed': {
          const passedQuizzes = await QuizAttempt.count({
            where: {
              user_id: userId,
              passed: true,
              score: { [Op.gte]: 50 }
            }
          });
          return {
            current: passedQuizzes,
            required: 1,
            percentage: Math.min(100, passedQuizzes * 100),
            description: `${passedQuizzes}/1 quizzes passed with 50%+ score`
          };
        }

        case 'first_assignment': {
          const submittedAssignments = await AssignmentSubmission.count({
            where: { user_id: userId }
          });
          return {
            current: submittedAssignments,
            required: 1,
            percentage: Math.min(100, submittedAssignments * 100),
            description: `${submittedAssignments}/1 assignments submitted`
          };
        }

        case 'first_discussion_post': {
          const posts = await DiscussionComment.count({
            where: { user_id: userId }
          });
          return {
            current: posts,
            required: 1,
            percentage: Math.min(100, posts * 100),
            description: `${posts}/1 discussion posts made`
          };
        }

        case 'weekly_goal': {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          const weeklyPoints = await PointsHistory.sum('points_earned', {
            where: {
              user_id: userId,
              created_at: { [Op.gte]: weekStart }
            }
          });
          const current = weeklyPoints || 0;
          return {
            current,
            required: 500,
            percentage: Math.min(100, (current / 500) * 100),
            description: `${current}/500 points earned this week`
          };
        }

        case 'perfect_week': {
          // This is more complex - would need to check all recent activities
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          
          const quizAttempts = await QuizAttempt.count({
            where: {
              user_id: userId,
              submitted_at: { [Op.gte]: weekStart },
              status: 'graded'
            }
          });

          const assignmentSubmissions = await AssignmentSubmission.count({
            where: {
              user_id: userId,
              submitted_at: { [Op.gte]: weekStart }
            }
          });

          const totalActivities = quizAttempts + assignmentSubmissions;
          const perfectActivities = await this.countPerfectActivities(userId, weekStart);
          
          return {
            current: perfectActivities,
            required: totalActivities,
            percentage: totalActivities > 0 ? (perfectActivities / totalActivities) * 100 : 0,
            description: `${perfectActivities}/${totalActivities} activities with 100% scores this week`
          };
        }

        case 'comeback_learner': {
          let streak = await LearningStreak.findOne({
            where: { user_id: userId }
          });

          if (!streak || !streak.last_activity_date) {
            return {
              current: 0,
              required: 7,
              percentage: 0,
              description: 'No previous activity to compare'
            };
          }

          const daysSinceLastActivity = Math.floor(
            (new Date() - new Date(streak.last_activity_date)) / (1000 * 60 * 60 * 24)
          );

          return {
            current: daysSinceLastActivity,
            required: 7,
            percentage: Math.min(100, (daysSinceLastActivity / 7) * 100),
            description: `${daysSinceLastActivity} days since last activity (need 7+ for comeback)`
          };
        }

        default:
          return {
            current: 0,
            required: 1,
            percentage: 0,
            description: 'Progress unknown'
          };
      }
    } catch (error) {
      console.error(`Error calculating progress for ${achievementType}:`, error);
      return {
        current: 0,
        required: 1,
        percentage: 0,
        description: 'Error calculating progress'
      };
    }
  }

  /**
   * Count activities with perfect scores in a given time period
   */
  static async countPerfectActivities(userId, sinceDate) {
    try {
      const models = this.getModels();
      const { QuizAttempt, AssignmentSubmission } = models;

      const quizAttempts = await QuizAttempt.count({
        where: {
          user_id: userId,
          submitted_at: { [Op.gte]: sinceDate },
          status: 'graded',
          score: 100
        }
      });

      const assignmentSubmissions = await AssignmentSubmission.count({
        where: {
          user_id: userId,
          submitted_at: { [Op.gte]: sinceDate },
          score: 100
        }
      });

      return quizAttempts + assignmentSubmissions;
    } catch (error) {
      console.error('Error counting perfect activities:', error);
      return 0;
    }
  }

  /**
   * Get description of how to unlock an achievement
   */
  static getHowToUnlockDescription(achievementType) {
    const descriptions = {
      first_course: 'Complete any course in the platform',
      first_quiz_passed: 'Pass any quiz with a score of 50% or higher',
      first_assignment: 'Submit any assignment',
      first_discussion_post: 'Post a comment in any course discussion',
      weekly_goal: 'Earn 500 or more points within any 7-day period',
      perfect_week: 'Complete all your activities (quizzes and assignments) with perfect 100% scores in a week',
      comeback_learner: 'Return to learning after 7 or more days of inactivity'
    };

    return descriptions[achievementType] || 'Complete the specified requirements';
  }
}

module.exports = AchievementService;
module.exports.ACHIEVEMENT_TYPES = ACHIEVEMENT_TYPES;