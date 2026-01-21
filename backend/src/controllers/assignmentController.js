const { Assignment, AssignmentSubmission, Lesson, Course, Section, User, Enrollment } = require('../models');
const { Op } = require('sequelize');
const AuditLogService = require('../services/AuditLogService');

class AssignmentController {
  
  static async createAssignment(req, res, next) {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user.id;

      const lesson = await Lesson.findOne({
        where: { id: lessonId },
        include: [{
          model: Section,
          as: 'section',
          include: [{
            model: Course,
            as: 'course',
            where: { id: courseId, instructor_id: userId }
          }]
        }]
      });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found or you are not the instructor'
        });
      }

      const assignment = await Assignment.create({
        lesson_id: lessonId,
        ...req.body
      });

      await AuditLogService.log('assignment_created', userId, 'Assignment', assignment.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or you are not the instructor'
        });
      }

      const submissionsCount = await AssignmentSubmission.count({
        where: { assignment_id: assignmentId }
      });

      if (submissionsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update assignment after submissions have been made'
        });
      }

      await assignment.update(req.body);
      await AuditLogService.log('assignment_updated', userId, 'Assignment', assignmentId, req.body);

      res.json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or you are not the instructor'
        });
      }

      await assignment.destroy();
      await AuditLogService.log('assignment_deleted', userId, 'Assignment', assignmentId);

      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentDetails(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course'
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      const courseId = assignment.lesson.section.course.id;
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId }
      });

      const isInstructor = assignment.lesson.section.course.instructor_id === userId;

      if (!enrollment && !isInstructor && req.user.role.name !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to view the assignment'
        });
      }

      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;
      const { content, external_url } = req.body;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId, is_published: true },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course'
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      const courseId = assignment.lesson.section.course.id;
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId, status: 'active' }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to submit the assignment'
        });
      }

      const previousSubmissions = await AssignmentSubmission.count({
        where: { assignment_id: assignmentId, user_id: userId }
      });

      if (previousSubmissions >= assignment.max_submissions) {
        return res.status(403).json({
          success: false,
          message: `You have reached the maximum number of submissions (${assignment.max_submissions})`
        });
      }

      const now = new Date();
      const isLate = assignment.due_date && now > assignment.due_date;

      let filePaths = [];
      if (req.files && req.files.length > 0) {
        filePaths = req.files.map(f => f.path);
      }

      if (assignment.submission_type === 'text' && !content) {
        return res.status(400).json({
          success: false,
          message: 'Text content is required for text submissions'
        });
      }

      if (assignment.submission_type === 'url' && !external_url) {
        return res.status(400).json({
          success: false,
          message: 'External URL is required for URL submissions'
        });
      }

      if ((assignment.submission_type === 'file' || assignment.submission_type === 'multi_file') && filePaths.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File upload is required for file submissions'
        });
      }

      const submission = await AssignmentSubmission.create({
        assignment_id: assignmentId,
        user_id: userId,
        enrollment_id: enrollment.id,
        submission_number: previousSubmissions + 1,
        submitted_at: now,
        content: content || null,
        external_url: external_url || null,
        file_paths: filePaths,
        status: isLate ? 'late' : 'submitted'
      });

      await AuditLogService.log('assignment_submitted', userId, 'AssignmentSubmission', submission.id, {
        assignment_id: assignmentId,
        submission_number: submission.submission_number
      });

      res.status(201).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: submission
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMySubmissions(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const submissions = await AssignmentSubmission.findAll({
        where: { assignment_id: assignmentId, user_id: userId },
        order: [['submitted_at', 'DESC']]
      });

      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubmissions(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or you are not the instructor'
        });
      }

      const where = { assignment_id: assignmentId };
      if (status) where.status = status;

      const submissions = await AssignmentSubmission.findAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']]
      });

      const total = await AssignmentSubmission.count({ where });

      res.json({
        success: true,
        data: submissions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const { assignmentId, submissionId } = req.params;
      const { score, feedback } = req.body;
      const userId = req.user.id;

      const submission = await AssignmentSubmission.findOne({
        where: { id: submissionId, assignment_id: assignmentId },
        include: [{
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Lesson,
            as: 'lesson',
            include: [{
              model: Section,
              as: 'section',
              include: [{
                model: Course,
                as: 'course',
                where: { instructor_id: userId }
              }]
            }]
          }]
        }]
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or you are not the instructor'
        });
      }

      await submission.update({
        score,
        feedback,
        status: 'graded',
        graded_at: new Date(),
        graded_by: userId
      });

      await AuditLogService.log('assignment_graded', userId, 'AssignmentSubmission', submissionId, req.body);

      res.json({
        success: true,
        message: 'Submission graded successfully',
        data: submission
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentAnalytics(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or you are not the instructor'
        });
      }

      const submissions = await AssignmentSubmission.findAll({
        where: { assignment_id: assignmentId },
        attributes: ['score', 'status', 'submitted_at']
      });

      const totalSubmissions = submissions.length;
      const gradedSubmissions = submissions.filter(s => s.status === 'graded');
      const averageScore = gradedSubmissions.length > 0 ?
        gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.score), 0) / gradedSubmissions.length : 0;

      const onTimeCount = submissions.filter(s => s.status !== 'late').length;
      const lateCount = submissions.filter(s => s.status === 'late').length;

      res.json({
        success: true,
        data: {
          total_submissions: totalSubmissions,
          graded_submissions: gradedSubmissions.length,
          average_score: Math.round(averageScore * 100) / 100,
          on_time_submissions: onTimeCount,
          late_submissions: lateCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssignmentController;
