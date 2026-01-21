const SystemSettingsService = require('../services/systemSettingsService');

let cached = { value: false, expiresAt: 0 };

const allowDuringMaintenance = (req) => {
  if (req.path === '/health') return true;
  if (req.path.startsWith('/api/auth')) return true;
  if (req.path.startsWith('/api/admin')) return true;
  return false;
};

const maintenanceMode = async (req, res, next) => {
  try {
    const now = Date.now();

    if (now > cached.expiresAt) {
      const enabled = await SystemSettingsService.getSettingValue('maintenance.enabled', false);
      cached = { value: Boolean(enabled), expiresAt: now + 10_000 };
    }

    if (!cached.value) {
      return next();
    }

    if (allowDuringMaintenance(req)) {
      return next();
    }

    return res.status(503).json({
      success: false,
      message: 'Platform is currently in maintenance mode. Please try again later.'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = maintenanceMode;
