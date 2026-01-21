const BackupService = require('../services/backupService');
const SystemSettingsService = require('../services/systemSettingsService');
const AuditLogService = require('../services/AuditLogService');

class AdminBackupController {
  static async createBackup(req, res, next) {
    try {
      const { backup_type = 'full' } = req.validatedBody;
      const backup = await BackupService.createBackup({ backup_type });

      await AuditLogService.logAction(req.user.id, 'admin:backup:create', 'BackupLog', backup.id, { backup_type }, req.ip, req.headers['user-agent']);

      res.status(201).json({ success: true, data: backup });
    } catch (error) {
      next(error);
    }
  }

  static async listBackups(req, res, next) {
    try {
      const backups = await BackupService.listBackups();
      res.json({ success: true, data: backups });
    } catch (error) {
      next(error);
    }
  }

  static async restoreBackup(req, res, next) {
    try {
      const { backupId } = req.params;
      const { confirm } = req.validatedBody;

      if (!confirm) {
        return res.status(400).json({ success: false, message: 'Confirmation required' });
      }

      await SystemSettingsService.upsertSetting('maintenance.enabled', true, 'boolean', {
        description: 'Maintenance mode enabled during restore',
        isPublic: true
      });

      const result = await BackupService.restoreBackup(backupId);

      await SystemSettingsService.upsertSetting('maintenance.enabled', false, 'boolean', {
        description: 'Maintenance mode disabled after restore',
        isPublic: true
      });

      await AuditLogService.logAction(req.user.id, 'admin:backup:restore', 'BackupLog', backupId, result, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'Restore completed', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBackup(req, res, next) {
    try {
      const { backupId } = req.params;
      const result = await BackupService.deleteBackup(backupId);

      await AuditLogService.logAction(req.user.id, 'admin:backup:delete', 'BackupLog', backupId, result, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'Backup deleted', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBackupStatus(req, res, next) {
    try {
      const status = await BackupService.getBackupStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminBackupController;
