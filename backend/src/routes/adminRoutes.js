const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');

const AdminDashboardController = require('../controllers/adminDashboardController');
const AdminUserController = require('../controllers/adminUserController');
const AdminModerationController = require('../controllers/adminModerationController');
const AdminCourseApprovalController = require('../controllers/adminCourseApprovalController');
const AdminSettingsController = require('../controllers/adminSettingsController');
const AdminBackupController = require('../controllers/adminBackupController');
const AdminAuditController = require('../controllers/adminAuditController');

const {
  createUserSchema,
  updateUserSchema,
  banUserSchema,
  reportContentSchema,
  reviewReportSchema,
  reviewCourseSchema,
  updateSettingSchema,
  restoreSettingsSchema,
  createBackupSchema,
  restoreBackupSchema
} = require('../validators/adminValidators');

// Public settings (no auth)
router.get('/settings', AdminSettingsController.getPublicSettings);

// Content report (any authenticated user)
router.post(
  '/moderation/report',
  authenticateToken,
  validateRequest(reportContentSchema),
  AdminModerationController.reportContent
);

// Admin-only
router.use(authenticateToken);
router.use(checkRole(['admin']));

router.get('/dashboard/overview', AdminDashboardController.getOverview);
router.get('/dashboard/stats', AdminDashboardController.getStats);

router.get('/users', AdminUserController.listUsers);
router.get('/users/:userId', AdminUserController.getUserDetails);
router.post('/users', validateRequest(createUserSchema), AdminUserController.createUser);
router.put('/users/:userId', validateRequest(updateUserSchema), AdminUserController.updateUser);
router.delete('/users/:userId', AdminUserController.deactivateUser);
router.put('/users/:userId/password', AdminUserController.resetPassword);
router.post('/users/:userId/ban', validateRequest(banUserSchema), AdminUserController.banUser);
router.delete('/users/:userId/ban', AdminUserController.unbanUser);
router.get('/users/:userId/activity', AdminUserController.getUserActivity);

router.get('/moderation/reports', AdminModerationController.listReports);
router.get('/moderation/reports/:reportId', AdminModerationController.getReportDetails);
router.put('/moderation/reports/:reportId', validateRequest(reviewReportSchema), AdminModerationController.reviewReport);
router.delete('/moderation/reports/:reportId', AdminModerationController.rejectReport);

router.get('/course-approvals', AdminCourseApprovalController.listCourseApprovals);
router.get('/course-approvals/:courseId', AdminCourseApprovalController.getApprovalDetails);
router.put('/course-approvals/:courseId', validateRequest(reviewCourseSchema), AdminCourseApprovalController.reviewCourse);

router.get('/settings/all', AdminSettingsController.getAllSettings);
router.put('/settings/:key', validateRequest(updateSettingSchema), AdminSettingsController.updateSetting);
router.get('/settings/backup', AdminSettingsController.backupSettings);
router.post('/settings/restore', validateRequest(restoreSettingsSchema), AdminSettingsController.restoreSettings);

router.post('/backup/create', validateRequest(createBackupSchema), AdminBackupController.createBackup);
router.get('/backup/list', AdminBackupController.listBackups);
router.post('/backup/restore/:backupId', validateRequest(restoreBackupSchema), AdminBackupController.restoreBackup);
router.delete('/backup/:backupId', AdminBackupController.deleteBackup);
router.get('/backup/status', AdminBackupController.getBackupStatus);

router.get('/audit-logs', AdminAuditController.listAuditLogs);
router.get('/activity-report', AdminAuditController.activityReport);

module.exports = router;
