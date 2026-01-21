const { Announcement, Notification, CourseDiscussion, DiscussionComment, Course, Lesson, User } = require('../models');
const { Op } = require('sequelize');
const NotificationService = require('../services/NotificationService');

class CommunicationController {
  
  static async createAnnouncement(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const { title, content, expires_at, pin_to_top } = req.body;

      const course = await Course.findOne({
        where: { id: courseId, instructor_id: userId }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or you are not the instructor'
        });
      }

      const announcement = await Announcement.create({
        course_id: courseId,
        title,
        content,
        created_by: userId,
        published_at: new Date(),
        expires_at: expires_at || null,
        pin_to_top: pin_to_top || false
      });

      await NotificationService.notifyEnrolledStudents(
        courseId,
        'announcement',
        `New Announcement: ${title}`,
        content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        'Announcement',
        announcement.id
      );

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAnnouncement(req, res, next) {
    try {
      const { announcementId } = req.params;
      const userId = req.user.id;

      const announcement = await Announcement.findOne({
        where: { id: announcementId },
        include: [{
          model: Course,
          as: 'course',
          where: { instructor_id: userId }
        }]
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found or you are not the instructor'
        });
      }

      await announcement.update(req.body);

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnnouncement(req, res, next) {
    try {
      const { announcementId } = req.params;
      const userId = req.user.id;

      const announcement = await Announcement.findOne({
        where: { id: announcementId },
        include: [{
          model: Course,
          as: 'course',
          where: { instructor_id: userId }
        }]
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found or you are not the instructor'
        });
      }

      await announcement.destroy();

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAnnouncements(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {
        course_id: courseId,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      };

      const announcements = await Announcement.findAll({
        where,
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['pin_to_top', 'DESC'],
          ['published_at', 'DESC']
        ]
      });

      const total = await Announcement.count({ where });

      res.json({
        success: true,
        data: announcements,
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

  static async getMyNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, type, read } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: userId };
      if (type) where.type = type;
      if (read !== undefined) where.is_read = read === 'true';

      const notifications = await Notification.findAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      const total = await Notification.count({ where });
      const unreadCount = await Notification.count({
        where: { user_id: userId, is_read: false }
      });

      res.json({
        success: true,
        data: notifications,
        unread_count: unreadCount,
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

  static async markNotificationAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.update({ is_read: true });

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllNotificationsAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscussion(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const { title, lesson_id } = req.body;

      const course = await Course.findOne({ where: { id: courseId } });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const discussion = await CourseDiscussion.create({
        course_id: courseId,
        lesson_id: lesson_id || null,
        title,
        created_by: userId
      });

      res.status(201).json({
        success: true,
        message: 'Discussion created successfully',
        data: discussion
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseDiscussions(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const discussions = await CourseDiscussion.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['is_pinned', 'DESC'],
          ['created_at', 'DESC']
        ]
      });

      const total = await CourseDiscussion.count({ where: { course_id: courseId } });

      res.json({
        success: true,
        data: discussions,
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

  static async createComment(req, res, next) {
    try {
      const { discussionId } = req.params;
      const userId = req.user.id;
      const { content, parent_comment_id } = req.body;

      const discussion = await CourseDiscussion.findOne({
        where: { id: discussionId }
      });

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found'
        });
      }

      if (discussion.is_locked) {
        return res.status(403).json({
          success: false,
          message: 'Discussion is locked'
        });
      }

      const comment = await DiscussionComment.create({
        discussion_id: discussionId,
        parent_comment_id: parent_comment_id || null,
        user_id: userId,
        content
      });

      if (parent_comment_id) {
        const parentComment = await DiscussionComment.findByPk(parent_comment_id);
        if (parentComment && parentComment.user_id !== userId) {
          await NotificationService.createNotification(
            parentComment.user_id,
            'comment_reply',
            'New Reply to Your Comment',
            `Someone replied to your comment in "${discussion.title}"`,
            'DiscussionComment',
            comment.id,
            `/courses/${discussion.course_id}/discussions/${discussionId}`
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Comment posted successfully',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDiscussionComments(req, res, next) {
    try {
      const { discussionId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const comments = await DiscussionComment.findAll({
        where: { discussion_id: discussionId, parent_comment_id: null },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'profile_picture_url']
          },
          {
            model: DiscussionComment,
            as: 'replies',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'profile_picture_url']
            }]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'ASC']]
      });

      const total = await DiscussionComment.count({
        where: { discussion_id: discussionId, parent_comment_id: null }
      });

      res.json({
        success: true,
        data: comments,
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

  static async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      const { content } = req.body;

      const comment = await DiscussionComment.findOne({
        where: { id: commentId, user_id: userId }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you are not the author'
        });
      }

      await comment.update({ content });

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  static async likeComment(req, res, next) {
    try {
      const { commentId } = req.params;

      const comment = await DiscussionComment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      await comment.increment('likes_count', { by: 1 });

      res.json({
        success: true,
        message: 'Comment liked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsAnswer(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const comment = await DiscussionComment.findOne({
        where: { id: commentId },
        include: [{
          model: CourseDiscussion,
          as: 'discussion',
          where: { created_by: userId }
        }]
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you are not the discussion creator'
        });
      }

      await comment.update({ is_marked_as_answer: true });

      res.json({
        success: true,
        message: 'Comment marked as answer'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommunicationController;
