const { CourseApproval, Course, Section, Lesson, User } = require('../models');
const { parsePagination } = require('../utils/pagination');
const AuditLogService = require('../services/AuditLogService');
const NotificationService = require('../services/NotificationService');

class AdminCourseApprovalController {
  static async listCourseApprovals(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
      const { status = 'pending' } = req.query;

      const where = {};
      if (status) where.status = status;

      const { count, rows } = await CourseApproval.findAndCountAll({
        where,
        include: [
          { model: Course, as: 'course', attributes: ['id', 'title', 'status', 'instructor_id', 'created_at'] },
          { model: User, as: 'submitter', attributes: ['id', 'email', 'first_name', 'last_name'] },
          { model: User, as: 'reviewer', attributes: ['id', 'email', 'first_name', 'last_name'] }
        ],
        order: [['submitted_at', 'DESC']],
        limit,
        offset
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalDetails(req, res, next) {
    try {
      const { courseId } = req.params;

      const approval = await CourseApproval.findOne({
        where: { course_id: courseId },
        include: [
          {
            model: Course,
            as: 'course',
            include: [{
              model: Section,
              as: 'sections',
              include: [{ model: Lesson, as: 'lessons' }]
            }]
          },
          { model: User, as: 'submitter', attributes: ['id', 'email', 'first_name', 'last_name'] },
          { model: User, as: 'reviewer', attributes: ['id', 'email', 'first_name', 'last_name'] }
        ],
        order: [['submitted_at', 'DESC']]
      });

      if (!approval) {
        return res.status(404).json({ success: false, message: 'Course approval not found' });
      }

      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  static async reviewCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const { status, reviewer_comments } = req.validatedBody;

      const approval = await CourseApproval.findOne({ where: { course_id: courseId }, order: [['submitted_at', 'DESC']] });
      if (!approval) {
        return res.status(404).json({ success: false, message: 'Course approval not found' });
      }

      approval.status = status;
      approval.reviewer_id = req.user.id;
      approval.reviewer_comments = reviewer_comments ?? null;
      approval.reviewed_at = new Date();
      await approval.save();

      if (status === 'approved') {
        await Course.update({ status: 'published', published_at: new Date() }, { where: { id: courseId } });
      }

      if (status === 'rejected') {
        await Course.update({ status: 'draft' }, { where: { id: courseId } });
      }

      await NotificationService.createNotification(
        approval.submitted_by,
        'course_update',
        'Course review completed',
        `Your course submission has been ${status}. ${reviewer_comments || ''}`,
        'Course',
        courseId,
        `/courses/${courseId}`
      ).catch(() => null);

      await AuditLogService.logAction(req.user.id, 'admin:course:review', 'CourseApproval', approval.id, { status }, req.ip, req.headers['user-agent']);

      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminCourseApprovalController;
