const Joi = require('joi');

const createAnnouncementSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  content: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Content must be at least 10 characters long',
      'any.required': 'Content is required'
    }),
  expires_at: Joi.date()
    .optional(),
  pin_to_top: Joi.boolean()
    .default(false)
});

const updateAnnouncementSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  content: Joi.string()
    .min(10)
    .optional(),
  expires_at: Joi.date()
    .optional()
    .allow(null),
  pin_to_top: Joi.boolean()
    .optional()
});

const createDiscussionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  lesson_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional()
});

const createCommentSchema = Joi.object({
  content: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Content must be at least 3 characters long',
      'any.required': 'Content is required'
    }),
  parent_comment_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional()
});

const updateCommentSchema = Joi.object({
  content: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Content must be at least 3 characters long',
      'any.required': 'Content is required'
    })
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  createDiscussionSchema,
  createCommentSchema,
  updateCommentSchema
};
