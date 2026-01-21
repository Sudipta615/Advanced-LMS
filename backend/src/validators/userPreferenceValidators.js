const Joi = require('joi');

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').optional(),
  language: Joi.string().min(2).max(10).optional(),
  notifications_enabled: Joi.boolean().optional(),
  email_notifications: Joi.boolean().optional(),
  digest_frequency: Joi.string().valid('immediate', 'daily', 'weekly').optional(),
  sidebar_collapsed: Joi.boolean().optional(),
  timezone: Joi.string().min(1).max(50).optional()
});

module.exports = { updatePreferencesSchema };
