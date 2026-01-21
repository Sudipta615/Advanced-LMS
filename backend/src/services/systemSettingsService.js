const { SystemSetting } = require('../models');
const { getRedisClient } = require('../config/redis');

const DEFAULT_SETTINGS = [
  {
    setting_key: 'platform.name',
    setting_value: 'Advanced LMS',
    setting_type: 'string',
    description: 'Platform name shown in the UI',
    is_public: true
  },
  {
    setting_key: 'platform.description',
    setting_value: 'A comprehensive learning management system for students and instructors',
    setting_type: 'string',
    description: 'Platform description shown in the UI',
    is_public: true
  },
  {
    setting_key: 'users.registration_open',
    setting_value: 'true',
    setting_type: 'boolean',
    description: 'Allow new user registrations',
    is_public: true
  },
  {
    setting_key: 'courses.require_approval',
    setting_value: 'false',
    setting_type: 'boolean',
    description: 'Require admin approval before a course can be published',
    is_public: true
  },
  {
    setting_key: 'uploads.max_file_size_mb',
    setting_value: '25',
    setting_type: 'number',
    description: 'Maximum file upload size in MB',
    is_public: false
  },
  {
    setting_key: 'maintenance.enabled',
    setting_value: 'false',
    setting_type: 'boolean',
    description: 'Enable maintenance mode (API will respond 503 for non-admin requests)',
    is_public: true
  },
  {
    setting_key: 'security.require_csrf',
    setting_value: 'false',
    setting_type: 'boolean',
    description: 'Require CSRF token for state-changing API requests',
    is_public: false
  },
  {
    setting_key: 'rate_limits.general_per_15min',
    setting_value: '100',
    setting_type: 'number',
    description: 'General API requests per 15 minutes',
    is_public: false
  }
];

const parseSettingValue = (setting) => {
  const raw = setting.setting_value;

  switch (setting.setting_type) {
    case 'boolean':
      return raw === 'true' || raw === '1';
    case 'number':
      return Number(raw);
    case 'json':
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    case 'string':
    default:
      return raw;
  }
};

const serializeSettingValue = (value, settingType) => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (settingType) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return String(value);
    case 'json':
      return JSON.stringify(value);
    case 'string':
    default:
      return String(value);
  }
};

class SystemSettingsService {
  static async ensureDefaults() {
    for (const def of DEFAULT_SETTINGS) {
      await SystemSetting.findOrCreate({
        where: { setting_key: def.setting_key },
        defaults: def
      });
    }
  }

  static async getPublicSettings() {
    await this.ensureDefaults();

    const redisClient = getRedisClient();
    const cacheKey = 'system_settings:public:v1';

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const settings = await SystemSetting.findAll({
      where: { is_public: true },
      order: [['setting_key', 'ASC']]
    });

    const result = settings.map(s => ({
      key: s.setting_key,
      value: parseSettingValue(s),
      type: s.setting_type,
      description: s.description,
      is_public: s.is_public
    }));

    if (redisClient) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
    }

    return result;
  }

  static async getAllSettings() {
    await this.ensureDefaults();

    const settings = await SystemSetting.findAll({
      order: [['setting_key', 'ASC']]
    });

    return settings.map(s => ({
      key: s.setting_key,
      value: parseSettingValue(s),
      type: s.setting_type,
      description: s.description,
      is_public: s.is_public
    }));
  }

  static async upsertSetting(key, value, settingType, { description, isPublic } = {}) {
    await this.ensureDefaults();

    const [setting] = await SystemSetting.upsert({
      setting_key: key,
      setting_value: serializeSettingValue(value, settingType),
      setting_type: settingType,
      description: description ?? null,
      is_public: Boolean(isPublic)
    }, { returning: true });

    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.del('system_settings:public:v1');
    }

    return {
      key: setting.setting_key,
      value: parseSettingValue(setting),
      type: setting.setting_type,
      description: setting.description,
      is_public: setting.is_public
    };
  }

  static async getSettingValue(key, defaultValue = null) {
    await this.ensureDefaults();

    const setting = await SystemSetting.findOne({ where: { setting_key: key } });
    if (!setting) return defaultValue;

    const parsed = parseSettingValue(setting);
    return parsed === null || parsed === undefined ? defaultValue : parsed;
  }

  static async exportSettings() {
    const all = await this.getAllSettings();
    return {
      exported_at: new Date().toISOString(),
      settings: all
    };
  }

  static async restoreSettings(payload) {
    const settings = payload?.settings;
    if (!Array.isArray(settings)) {
      throw new Error('Invalid settings backup format');
    }

    for (const entry of settings) {
      if (!entry?.key || !entry?.type) continue;
      await this.upsertSetting(entry.key, entry.value, entry.type, {
        description: entry.description,
        isPublic: entry.is_public
      });
    }

    return { restored: settings.length };
  }
}

module.exports = SystemSettingsService;
