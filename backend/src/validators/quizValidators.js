const Joi = require('joi');

const createQuizSchema = Joi.object({
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
  quiz_type: Joi.string()
    .valid('practice', 'graded', 'final')
    .required()
    .messages({
      'any.required': 'Quiz type is required',
      'any.only': 'Quiz type must be one of: practice, graded, final'
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
  time_limit_minutes: Joi.number()
    .integer()
    .positive()
    .optional(),
  allow_retake: Joi.boolean()
    .default(true),
  max_attempts: Joi.number()
    .integer()
    .positive()
    .default(3),
  randomize_questions: Joi.boolean()
    .default(false),
  show_correct_answers: Joi.boolean()
    .default(false),
  shuffle_options: Joi.boolean()
    .default(true),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

const updateQuizSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .optional(),
  quiz_type: Joi.string()
    .valid('practice', 'graded', 'final')
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
  time_limit_minutes: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  allow_retake: Joi.boolean()
    .optional(),
  max_attempts: Joi.number()
    .integer()
    .positive()
    .optional(),
  randomize_questions: Joi.boolean()
    .optional(),
  show_correct_answers: Joi.boolean()
    .optional(),
  shuffle_options: Joi.boolean()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const createQuestionSchema = Joi.object({
  question_text: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Question text must be at least 10 characters long',
      'any.required': 'Question text is required'
    }),
  question_type: Joi.string()
    .valid('multiple_choice', 'true_false', 'short_answer', 'essay')
    .required()
    .messages({
      'any.required': 'Question type is required',
      'any.only': 'Question type must be one of: multiple_choice, true_false, short_answer, essay'
    }),
  points: Joi.number()
    .integer()
    .positive()
    .default(1),
  explanation: Joi.string()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

const updateQuestionSchema = Joi.object({
  question_text: Joi.string()
    .min(10)
    .optional(),
  question_type: Joi.string()
    .valid('multiple_choice', 'true_false', 'short_answer', 'essay')
    .optional(),
  points: Joi.number()
    .integer()
    .positive()
    .optional(),
  explanation: Joi.string()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const createAnswerOptionSchema = Joi.object({
  option_text: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Option text is required'
    }),
  is_correct: Joi.boolean()
    .required()
    .messages({
      'any.required': 'is_correct field is required'
    }),
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

const updateAnswerOptionSchema = Joi.object({
  option_text: Joi.string()
    .min(1)
    .optional(),
  is_correct: Joi.boolean()
    .optional(),
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const submitQuizSchema = Joi.object({
  time_spent_seconds: Joi.number()
    .integer()
    .min(0)
    .required(),
  answers: Joi.object()
    .pattern(
      Joi.string().guid({ version: ['uuidv4'] }),
      Joi.string().allow('')
    )
    .required()
    .messages({
      'any.required': 'Answers are required'
    })
});

const gradeResponseSchema = Joi.object({
  is_correct: Joi.boolean()
    .optional(),
  points_earned: Joi.number()
    .min(0)
    .optional(),
  instructor_feedback: Joi.string()
    .optional()
}).or('is_correct', 'points_earned').messages({
  'object.missing': 'Either is_correct or points_earned must be provided'
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerOptionSchema,
  updateAnswerOptionSchema,
  submitQuizSchema,
  gradeResponseSchema
};
