const Joi = require('joi');

const createAssignmentSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .min(20)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'any.required': 'Description is required'
    }),
  instructions: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Instructions must be at least 10 characters long',
      'any.required': 'Instructions are required'
    }),
  total_points: Joi.number()
    .integer()
    .positive()
    .default(100),
  passing_score: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(70),
  due_date: Joi.date()
    .optional(),
  submission_type: Joi.string()
    .valid('file', 'text', 'url', 'multi_file')
    .required()
    .messages({
      'any.required': 'Submission type is required',
      'any.only': 'Submission type must be one of: file, text, url, multi_file'
    }),
  allowed_file_types: Joi.array()
    .items(Joi.string())
    .default([]),
  max_file_size_mb: Joi.number()
    .integer()
    .positive()
    .default(50),
  max_submissions: Joi.number()
    .integer()
    .positive()
    .default(3),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .min(20)
    .optional(),
  instructions: Joi.string()
    .min(10)
    .optional(),
  total_points: Joi.number()
    .integer()
    .positive()
    .optional(),
  passing_score: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional(),
  due_date: Joi.date()
    .optional()
    .allow(null),
  submission_type: Joi.string()
    .valid('file', 'text', 'url', 'multi_file')
    .optional(),
  allowed_file_types: Joi.array()
    .items(Joi.string())
    .optional(),
  max_file_size_mb: Joi.number()
    .integer()
    .positive()
    .optional(),
  max_submissions: Joi.number()
    .integer()
    .positive()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const submitAssignmentSchema = Joi.object({
  content: Joi.string()
    .optional(),
  external_url: Joi.string()
    .uri()
    .optional()
});

const gradeSubmissionSchema = Joi.object({
  score: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Score is required',
      'number.min': 'Score must be non-negative'
    }),
  feedback: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Feedback must be at least 10 characters long',
      'any.required': 'Feedback is required'
    })
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema
};
