const { User, Course, Enrollment, LessonCompletion, QuizAttempt, AssignmentSubmission, Certificate } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class AnalyticsController {
  
  static async getStudentDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      const enrollments = await Enrollment.findAll({
        where: { user_id: userId },
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail_url']
        }]
      });

      const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

      const quizAttempts = await QuizAttempt.findAll({
        where: { user_id: userId, status: 'graded' },
        attributes: ['score', 'passed'],
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      const avgQuizScore = quizAttempts.length > 0 ?
        quizAttempts.reduce((sum, a) => sum + parseFloat(a.score), 0) / quizAttempts.length : 0;

      const assignments = await AssignmentSubmission.findAll({
        where: { user_id: userId },
        attributes: ['status', 'score']
      });

      const certificates = await Certificate.count({
        where: { user_id: userId }
      });

      res.json({
        success: true,
        data: {
          courses_enrolled: activeEnrollments,
          courses_completed: completedEnrollments,
          average_quiz_score: Math.round(avgQuizScore * 100) / 100,
          assignments_submitted: assignments.filter(a => a.status !== 'submitted').length,
          assignments_pending: assignments.filter(a => a.status === 'submitted').length,
          certificates_earned: certificates,
          recent_quiz_scores: quizAttempts.map(a => ({
            score: a.score,
            passed: a.passed
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProgress(req, res, next) {
    try {
      const userId = req.user.id;

      const enrollments = await Enrollment.findAll({
        where: { user_id: userId },
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }],
        order: [['enrolled_at', 'DESC']]
      });

      const progressData = enrollments.map(e => ({
        course_id: e.course.id,
        course_title: e.course.title,
        completion_percentage: e.completion_percentage,
        status: e.status,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at
      }));

      res.json({
        success: true,
        data: progressData
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstructorDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      const courses = await Course.findAll({
        where: { instructor_id: userId },
        attributes: ['id', 'title', 'status']
      });

      const courseIds = courses.map(c => c.id);

      const totalStudents = await Enrollment.count({
        where: { course_id: { [Op.in]: courseIds } },
        distinct: true,
        col: 'user_id'
      });

      const enrollments = await Enrollment.findAll({
        where: { course_id: { [Op.in]: courseIds } },
        attributes: ['status', 'completion_percentage']
      });

      const avgCompletion = enrollments.length > 0 ?
        enrollments.reduce((sum, e) => sum + parseFloat(e.completion_percentage), 0) / enrollments.length : 0;

      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = enrollments.length > 0 ? (completedCount / enrollments.length) * 100 : 0;

      res.json({
        success: true,
        data: {
          total_courses: courses.length,
          published_courses: courses.filter(c => c.status === 'published').length,
          total_students: totalStudents,
          average_completion: Math.round(avgCompletion * 100) / 100,
          completion_rate: Math.round(completionRate * 100) / 100
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstructorCourseAnalytics(req, res, next) {
    try {
      const userId = req.user.id;

      const courses = await Course.findAll({
        where: { instructor_id: userId },
        attributes: ['id', 'title', 'created_at'],
        include: [{
          model: Enrollment,
          as: 'enrollments',
          attributes: ['status', 'completion_percentage']
        }]
      });

      const analytics = courses.map(course => {
        const enrollments = course.enrollments || [];
        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
        const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
        const avgCompletion = totalEnrollments > 0 ?
          enrollments.reduce((sum, e) => sum + parseFloat(e.completion_percentage), 0) / totalEnrollments : 0;

        return {
          course_id: course.id,
          course_title: course.title,
          total_enrollments: totalEnrollments,
          active_enrollments: activeEnrollments,
          completed_enrollments: completedEnrollments,
          average_completion: Math.round(avgCompletion * 100) / 100,
          completion_rate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0
        };
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseStudentProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const course = await Course.findOne({
        where: { id: courseId, instructor_id: userId }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or you are not the instructor'
        });
      }

      const enrollments = await Enrollment.findAll({
        where: { course_id: courseId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }],
        order: [['enrolled_at', 'DESC']]
      });

      const progressData = await Promise.all(enrollments.map(async (enrollment) => {
        const quizAttempts = await QuizAttempt.findAll({
          where: { user_id: enrollment.user_id, enrollment_id: enrollment.id },
          attributes: ['score', 'status']
        });

        const assignments = await AssignmentSubmission.findAll({
          where: { user_id: enrollment.user_id, enrollment_id: enrollment.id },
          attributes: ['score', 'status']
        });

        const avgQuizScore = quizAttempts.length > 0 ?
          quizAttempts.filter(a => a.score !== null).reduce((sum, a) => sum + parseFloat(a.score), 0) / quizAttempts.filter(a => a.score !== null).length : 0;

        const avgAssignmentScore = assignments.length > 0 ?
          assignments.filter(a => a.score !== null).reduce((sum, a) => sum + parseFloat(a.score), 0) / assignments.filter(a => a.score !== null).length : 0;

        return {
          user: enrollment.user,
          enrollment_status: enrollment.status,
          completion_percentage: enrollment.completion_percentage,
          enrolled_at: enrollment.enrolled_at,
          quiz_attempts: quizAttempts.length,
          average_quiz_score: Math.round(avgQuizScore * 100) / 100,
          assignment_submissions: assignments.length,
          average_assignment_score: Math.round(avgAssignmentScore * 100) / 100
        };
      }));

      res.json({
        success: true,
        data: progressData
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminOverview(req, res, next) {
    try {
      const totalUsers = await User.count();
      const totalCourses = await Course.count();
      const totalEnrollments = await Enrollment.count();

      const enrollmentsByMonth = await Enrollment.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('enrolled_at')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('enrolled_at'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('enrolled_at')), 'DESC']],
        limit: 12,
        raw: true
      });

      res.json({
        success: true,
        data: {
          total_users: totalUsers,
          total_courses: totalCourses,
          total_enrollments: totalEnrollments,
          enrollment_trend: enrollmentsByMonth
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAnalytics(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: [
          'role_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role_id'],
        raw: true
      });

      const activeUsers = await User.count({
        where: {
          last_login: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      res.json({
        success: true,
        data: {
          user_distribution: users,
          active_users_last_30_days: activeUsers
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAnalytics(req, res, next) {
    try {
      const courses = await Course.findAll({
        attributes: [
          'id',
          'title',
          'status',
          [sequelize.literal('(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = "Course".id)'), 'enrollment_count']
        ],
        order: [[sequelize.literal('enrollment_count'), 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
