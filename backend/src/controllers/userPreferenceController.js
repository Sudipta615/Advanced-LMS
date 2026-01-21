const { UserPreference } = require('../models');
const AuditLogService = require('../services/AuditLogService');

class UserPreferenceController {
  static async getPreferences(req, res, next) {
    try {
      const pref = await UserPreference.findOne({ where: { user_id: req.user.id } });

      res.json({
        success: true,
        data: pref || {
          theme: 'system',
          language: 'en',
          notifications_enabled: true,
          email_notifications: true,
          digest_frequency: 'immediate',
          sidebar_collapsed: false,
          timezone: 'UTC'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      const [pref] = await UserPreference.upsert({
        user_id: req.user.id,
        ...req.validatedBody
      }, { returning: true });

      await AuditLogService.logAction(req.user.id, 'user:preferences:update', 'UserPreference', pref.id, req.validatedBody, req.ip, req.headers['user-agent']);

      res.json({ success: true, data: pref });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserPreferenceController;
