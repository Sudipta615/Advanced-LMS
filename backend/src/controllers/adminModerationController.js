const { ContentModeration, User, DiscussionComment, Announcement, Course } = require('../models');
const AuditLogService = require('../services/AuditLogService');
const { parsePagination } = require('../utils/pagination');

class AdminModerationController {
  static async reportContent(req, res, next) {
    try {
      const { resource_type, resource_id, reason, moderation_type = 'report' } = req.validatedBody;

      const report = await ContentModeration.create({
        resource_type,
        resource_id,
        reported_by: req.user.id,
        moderation_type,
        reason,
        status: 'pending'
      });

      await AuditLogService.logAction(req.user.id, 'moderation:report', 'ContentModeration', report.id, { resource_type, resource_id }, req.ip, req.headers['user-agent']);

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async listReports(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
      const { status, resource_type } = req.query;

      const where = {};
      if (status) where.status = status;
      if (resource_type) where.resource_type = resource_type;

      const { count, rows } = await ContentModeration.findAndCountAll({
        where,
        include: [
          { model: User, as: 'reporter', attributes: ['id', 'email', 'first_name', 'last_name'] },
          { model: User, as: 'moderator', attributes: ['id', 'email', 'first_name', 'last_name'] }
        ],
        order: [['created_at', 'DESC']],
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

  static async getReportDetails(req, res, next) {
    try {
      const { reportId } = req.params;

      const report = await ContentModeration.findByPk(reportId, {
        include: [
          { model: User, as: 'reporter', attributes: ['id', 'email', 'first_name', 'last_name'] },
          { model: User, as: 'moderator', attributes: ['id', 'email', 'first_name', 'last_name'] }
        ]
      });

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const contentPreview = await this._loadResourcePreview(report.resource_type, report.resource_id);

      res.json({
        success: true,
        data: {
          report,
          preview: contentPreview
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async reviewReport(req, res, next) {
    try {
      const { reportId } = req.params;
      const { status, action_taken, moderator_notes } = req.validatedBody;

      const report = await ContentModeration.findByPk(reportId);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      report.status = status;
      report.action_taken = action_taken;
      report.moderator_notes = moderator_notes ?? null;
      report.moderator_id = req.user.id;
      await report.save();

      if (status === 'removed') {
        await this._removeResource(report.resource_type, report.resource_id);
      }

      await AuditLogService.logAction(req.user.id, 'moderation:review', 'ContentModeration', report.id, { status, action_taken }, req.ip, req.headers['user-agent']);

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async rejectReport(req, res, next) {
    try {
      const { reportId } = req.params;

      const report = await ContentModeration.findByPk(reportId);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      report.status = 'rejected';
      report.moderator_id = req.user.id;
      report.action_taken = 'rejected';
      await report.save();

      await AuditLogService.logAction(req.user.id, 'moderation:reject', 'ContentModeration', report.id, { status: 'rejected' }, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'Report rejected', data: report });
    } catch (error) {
      next(error);
    }
  }

  static async _loadResourcePreview(resourceType, resourceId) {
    switch (resourceType) {
      case 'discussion_comment':
        return DiscussionComment.findByPk(resourceId, { attributes: ['id', 'content', 'user_id', 'created_at'] });
      case 'announcement':
        return Announcement.findByPk(resourceId, { attributes: ['id', 'title', 'content', 'course_id', 'created_by', 'published_at'] });
      case 'course':
        return Course.findByPk(resourceId, { attributes: ['id', 'title', 'status', 'instructor_id', 'created_at'] });
      case 'user_profile':
      default:
        return null;
    }
  }

  static async _removeResource(resourceType, resourceId) {
    switch (resourceType) {
      case 'discussion_comment':
        await DiscussionComment.destroy({ where: { id: resourceId } });
        return;
      case 'announcement':
        await Announcement.destroy({ where: { id: resourceId } });
        return;
      case 'course':
        await Course.update({ status: 'archived' }, { where: { id: resourceId } });
        return;
      case 'user_profile':
      default:
        return;
    }
  }
}

module.exports = AdminModerationController;
