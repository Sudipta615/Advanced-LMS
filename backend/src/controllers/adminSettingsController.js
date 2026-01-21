const SystemSettingsService = require('../services/systemSettingsService');
const AuditLogService = require('../services/AuditLogService');

class AdminSettingsController {
  static async getPublicSettings(req, res, next) {
    try {
      const settings = await SystemSettingsService.getPublicSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSettings(req, res, next) {
    try {
      const settings = await SystemSettingsService.getAllSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value, type, description, is_public } = req.validatedBody;

      const updated = await SystemSettingsService.upsertSetting(key, value, type, {
        description,
        isPublic: is_public
      });

      await AuditLogService.logAction(req.user.id, 'admin:settings:update', 'SystemSetting', key, { value, type }, req.ip, req.headers['user-agent']);

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async backupSettings(req, res, next) {
    try {
      const payload = await SystemSettingsService.exportSettings();
      res.json({ success: true, data: payload });
    } catch (error) {
      next(error);
    }
  }

  static async restoreSettings(req, res, next) {
    try {
      const result = await SystemSettingsService.restoreSettings(req.validatedBody);

      await AuditLogService.logAction(req.user.id, 'admin:settings:restore', 'SystemSetting', null, result, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'Settings restored', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminSettingsController;
