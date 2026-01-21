const fs = require('fs');
const path = require('path');
const { BackupLog } = require('../models');
const SystemSettingsService = require('./systemSettingsService');

const BACKUP_DIR = path.join(__dirname, '../../backups');

const ensureBackupDir = async () => {
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
};

const getFileSizeMb = async (filePath) => {
  const stat = await fs.promises.stat(filePath);
  return Math.round((stat.size / (1024 * 1024)) * 100) / 100;
};

class BackupService {
  static async createBackup({ backup_type = 'full' } = {}) {
    await ensureBackupDir();

    const backupLog = await BackupLog.create({
      backup_type,
      file_path: '',
      status: 'in_progress',
      file_size_mb: null,
      error_message: null
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${backup_type}-backup-${timestamp}-${backupLog.id}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    try {
      const settings = await SystemSettingsService.exportSettings();

      const payload = {
        id: backupLog.id,
        backup_type,
        created_at: new Date().toISOString(),
        includes: {
          system_settings: true,
          database_dump: false,
          file_storage: false
        },
        data: {
          system_settings: settings
        }
      };

      await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2));

      const sizeMb = await getFileSizeMb(filePath);
      backupLog.file_path = filename;
      backupLog.file_size_mb = sizeMb;
      backupLog.status = 'completed';
      await backupLog.save();

      return backupLog;
    } catch (error) {
      backupLog.status = 'failed';
      backupLog.error_message = error.message;
      await backupLog.save();
      throw error;
    }
  }

  static async listBackups() {
    await ensureBackupDir();
    const backups = await BackupLog.findAll({ order: [['created_at', 'DESC']] });
    return backups;
  }

  static async restoreBackup(backupId) {
    await ensureBackupDir();

    const backupLog = await BackupLog.findByPk(backupId);
    if (!backupLog) {
      throw new Error('Backup not found');
    }

    const filePath = path.join(BACKUP_DIR, backupLog.file_path);
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    const payload = JSON.parse(raw);

    if (payload?.data?.system_settings) {
      await SystemSettingsService.restoreSettings(payload.data.system_settings);
    }

    return { restored_backup_id: backupId };
  }

  static async deleteBackup(backupId) {
    await ensureBackupDir();

    const backupLog = await BackupLog.findByPk(backupId);
    if (!backupLog) {
      throw new Error('Backup not found');
    }

    const filePath = path.join(BACKUP_DIR, backupLog.file_path);
    await fs.promises.rm(filePath, { force: true });
    await backupLog.destroy();

    return { deleted: true };
  }

  static async getBackupStatus() {
    const lastBackup = await BackupLog.findOne({ where: { status: 'completed' }, order: [['created_at', 'DESC']] });
    return {
      last_backup_time: lastBackup ? lastBackup.created_at : null,
      next_scheduled_backup: null
    };
  }
}

module.exports = BackupService;
