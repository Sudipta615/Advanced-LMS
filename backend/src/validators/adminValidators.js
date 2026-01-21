const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  role: Joi.string().valid('admin', 'instructor', 'student').required(),
  password: Joi.string().min(8).optional(),
  send_welcome_email: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).optional(),
  last_name: Joi.string().min(1).max(100).optional(),
  bio: Joi.string().allow('').allow(null).optional(),
  profile_picture_url: Joi.string().uri().allow(null).optional(),
  role: Joi.string().valid('admin', 'instructor', 'student').optional(),
  is_active: Joi.boolean().optional()
});

const banUserSchema = Joi.object({
  reason: Joi.string().min(3).max(2000).required(),
  ban_type: Joi.string().valid('temporary', 'permanent').default('temporary'),
  expires_at: Joi.date().optional()
});

const reportContentSchema = Joi.object({
  resource_type: Joi.string().valid('discussion_comment', 'announcement', 'user_profile', 'course').required(),
  resource_id: Joi.string().required(),
  reason: Joi.string().min(3).max(5000).required(),
  moderation_type: Joi.string().valid('report', 'flag', 'auto_filter').default('report')
});

const reviewReportSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'removed').required(),
  action_taken: Joi.string().min(1).max(5000).required(),
  moderator_notes: Joi.string().allow('').allow(null).optional()
});

const reviewCourseSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reviewer_comments: Joi.string().allow('').allow(null).optional()
});

const updateSettingSchema = Joi.object({
  value: Joi.any().required(),
  type: Joi.string().valid('string', 'boolean', 'number', 'json').required(),
  description: Joi.string().allow('').allow(null).optional(),
  is_public: Joi.boolean().default(false)
});

const restoreSettingsSchema = Joi.object({
  exported_at: Joi.string().optional(),
  settings: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      value: Joi.any().required(),
      type: Joi.string().valid('string', 'boolean', 'number', 'json').required(),
      description: Joi.string().allow(null).optional(),
      is_public: Joi.boolean().optional()
    })
  ).required()
});

const createBackupSchema = Joi.object({
  backup_type: Joi.string().valid('full', 'incremental').default('full')
});

const restoreBackupSchema = Joi.object({
  confirm: Joi.boolean().valid(true).required()
});

module.exports = {
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
};
