const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  createDiscussionSchema,
  createCommentSchema,
  updateCommentSchema
} = require('../validators/communicationValidators');

router.use(authenticateToken);

// Announcements
router.post(
  '/courses/:courseId/announcements',
  checkRole(['instructor', 'admin']),
  validateRequest(createAnnouncementSchema),
  communicationController.createAnnouncement
);

router.put(
  '/announcements/:announcementId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateAnnouncementSchema),
  communicationController.updateAnnouncement
);

router.delete(
  '/announcements/:announcementId',
  checkRole(['instructor', 'admin']),
  communicationController.deleteAnnouncement
);

router.get(
  '/courses/:courseId/announcements',
  communicationController.getCourseAnnouncements
);

// Notifications
router.get('/notifications', communicationController.getMyNotifications);
router.put('/notifications/:notificationId/read', communicationController.markNotificationAsRead);
router.put('/notifications/read-all', communicationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', communicationController.deleteNotification);

// Discussions
router.post(
  '/courses/:courseId/discussions',
  validateRequest(createDiscussionSchema),
  communicationController.createDiscussion
);

router.get(
  '/courses/:courseId/discussions',
  communicationController.getCourseDiscussions
);

router.post(
  '/discussions/:discussionId/comments',
  validateRequest(createCommentSchema),
  communicationController.createComment
);

router.get(
  '/discussions/:discussionId/comments',
  communicationController.getDiscussionComments
);

router.put(
  '/comments/:commentId',
  validateRequest(updateCommentSchema),
  communicationController.updateComment
);

router.post(
  '/comments/:commentId/like',
  communicationController.likeComment
);

router.put(
  '/comments/:commentId/mark-answer',
  communicationController.markAsAnswer
);

module.exports = router;
