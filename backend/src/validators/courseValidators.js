const Joi = require('joi');

const createCourseSchema = Joi.object({
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
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 5000 characters',
      'any.required': 'Description is required'
    }),
  category_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Category ID must be a valid UUID',
      'any.required': 'Category ID is required'
    }),
  difficulty_level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .default('beginner'),
  estimated_hours: Joi.number()
    .positive()
    .optional(),
  price: Joi.number()
    .min(0)
    .default(0.00),
  tags: Joi.array()
    .items(Joi.string())
    .default([]),
  prerequisites: Joi.array()
    .items(Joi.string().guid({ version: ['uuidv4'] }))
    .default([]),
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft'),
  visibility: Joi.string()
    .valid('public', 'private', 'restricted')
    .default('public')
});

const updateCourseSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .min(10)
    .max(5000)
    .optional(),
  category_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional(),
  difficulty_level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  estimated_hours: Joi.number()
    .positive()
    .optional(),
  price: Joi.number()
    .min(0)
    .optional(),
  tags: Joi.array()
    .items(Joi.string())
    .optional(),
  prerequisites: Joi.array()
    .items(Joi.string().guid({ version: ['uuidv4'] }))
    .optional(),
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .optional(),
  visibility: Joi.string()
    .valid('public', 'private', 'restricted')
    .optional()
});

const createSectionSchema = Joi.object({
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
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

const updateSectionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const createLessonSchema = Joi.object({
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
    .optional(),
  content: Joi.string()
    .optional(),
  lesson_type: Joi.string()
    .valid('video', 'document', 'quiz', 'assignment', 'text')
    .required()
    .messages({
      'any.required': 'Lesson type is required',
      'any.only': 'Lesson type must be one of: video, document, quiz, assignment, text'
    }),
  video_url: Joi.when('lesson_type', {
    is: 'video',
    then: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Video URL must be a valid URL',
        'any.required': 'Video URL is required for video lessons'
      }),
    otherwise: Joi.string()
      .uri()
      .optional()
  }),
  video_provider: Joi.when('lesson_type', {
    is: 'video',
    then: Joi.string()
      .valid('youtube', 'vimeo', 'self_hosted')
      .optional(),
    otherwise: Joi.string()
      .valid('youtube', 'vimeo', 'self_hosted')
      .optional()
  }),
  document_paths: Joi.array()
    .items(Joi.string())
    .default([]),
  external_links: Joi.array()
    .items(Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required()
    }))
    .default([]),
  markdown_content: Joi.string()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0),
  duration_minutes: Joi.number()
    .integer()
    .min(1)
    .optional(),
  is_published: Joi.boolean()
    .default(false),
  requires_completion: Joi.boolean()
    .default(true)
});

const updateLessonSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .optional(),
  content: Joi.string()
    .optional(),
  lesson_type: Joi.string()
    .valid('video', 'document', 'quiz', 'assignment', 'text')
    .optional(),
  video_url: Joi.when('lesson_type', {
    is: 'video',
    then: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Video URL must be a valid URL',
        'any.required': 'Video URL is required for video lessons'
      }),
    otherwise: Joi.string()
      .uri()
      .optional()
  }),
  video_provider: Joi.when('lesson_type', {
    is: 'video',
    then: Joi.string()
      .valid('youtube', 'vimeo', 'self_hosted')
      .optional(),
    otherwise: Joi.string()
      .valid('youtube', 'vimeo', 'self_hosted')
      .optional()
  }),
  document_paths: Joi.array()
    .items(Joi.string())
    .optional(),
  external_links: Joi.array()
    .items(Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required()
    }))
    .optional(),
  markdown_content: Joi.string()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional(),
  duration_minutes: Joi.number()
    .integer()
    .min(1)
    .optional(),
  is_published: Joi.boolean()
    .optional(),
  requires_completion: Joi.boolean()
    .optional()
});

const enrollCourseSchema = Joi.object({
  course_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Course ID must be a valid UUID',
      'any.required': 'Course ID is required'
    })
});

const completeLessonSchema = Joi.object({
  time_spent_minutes: Joi.number()
    .integer()
    .min(0)
    .default(0),
  notes: Joi.string()
    .optional()
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  createSectionSchema,
  updateSectionSchema,
  createLessonSchema,
  updateLessonSchema,
  enrollCourseSchema,
  completeLessonSchema
};