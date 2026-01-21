const Joi = require('joi');

// Common UUID pattern
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// =============================================================================
// QUERY PARAMETER SCHEMAS
// =============================================================================

/**
 * Schema for badges query parameters
 */
const badgesQuerySchema = Joi.object({
  category: Joi.string()
    .valid('Achievement', 'Milestone', 'Skill', 'Social')
    .messages({
      'any.only': 'Category must be one of: Achievement, Milestone, Skill, Social'
    }),
  difficulty: Joi.string()
    .valid('bronze', 'silver', 'gold', 'platinum')
    .messages({
      'any.only': 'Difficulty must be one of: bronze, silver, gold, platinum'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

/**
 * Schema for points history query parameters
 */
const pointsHistorySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  activityType: Joi.string()
    .valid(
      'quiz_completed',
      'assignment_submitted',
      'course_completed',
      'discussion_participated',
      'lesson_completed',
      'daily_login',
      'streak_bonus'
    )
    .messages({
      'any.only': 'Activity type must be a valid activity type'
    }),
  dateRange: Joi.object({
    start: Joi.date()
      .iso()
      .messages({
        'date.format': 'Start date must be in ISO format'
      }),
    end: Joi.date()
      .iso()
      .messages({
        'date.format': 'End date must be in ISO format'
      })
  }).custom((value, helpers) => {
    if (value.start && value.end && new Date(value.start) >= new Date(value.end)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Date range validation')
});

/**
 * Schema for leaderboard query parameters
 */
const leaderboardQuerySchema = Joi.object({
  period: Joi.string()
    .valid('all_time', 'monthly', 'weekly')
    .default('all_time')
    .messages({
      'any.only': 'Period must be one of: all_time, monthly, weekly'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    })
});

/**
 * Schema for course leaderboard parameters
 */
const courseLeaderboardSchema = Joi.object({
  period: Joi.string()
    .valid('all_time', 'monthly', 'weekly')
    .default('all_time')
    .messages({
      'any.only': 'Period must be one of: all_time, monthly, weekly'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    })
}).unknown(true);

/**
 * Schema for user rank query parameters
 */
const userRankSchema = Joi.object({
  period: Joi.string()
    .valid('all_time', 'monthly', 'weekly')
    .default('all_time')
    .messages({
      'any.only': 'Period must be one of: all_time, monthly, weekly'
    }),
  courseId: Joi.string()
    .pattern(uuidPattern)
    .messages({
      'string.pattern.base': 'Course ID must be a valid UUID'
    })
});

/**
 * Schema for streak calendar query parameters
 */
const streakCalendarSchema = Joi.object({
  days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(30)
    .messages({
      'number.base': 'Days must be a number',
      'number.integer': 'Days must be an integer',
      'number.min': 'Days must be at least 1',
      'number.max': 'Days cannot exceed 365'
    })
});

// =============================================================================
// URL PARAMETER SCHEMAS
// =============================================================================

/**
 * Schema for badge ID parameter
 */
const badgeIdSchema = Joi.object({
  badgeId: Joi.string()
    .pattern(uuidPattern)
    .required()
    .messages({
      'string.pattern.base': 'Badge ID must be a valid UUID',
      'any.required': 'Badge ID is required'
    })
});

// =============================================================================
// REQUEST BODY SCHEMAS
// =============================================================================

/**
 * Schema for creating a badge
 */
const createBadgeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Badge name cannot be empty',
      'string.min': 'Badge name must be at least 3 characters long',
      'string.max': 'Badge name cannot exceed 100 characters',
      'any.required': 'Badge name is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .required()
    .messages({
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
  categoryId: Joi.string()
    .pattern(uuidPattern)
    .required()
    .messages({
      'string.pattern.base': 'Category ID must be a valid UUID',
      'any.required': 'Category ID is required'
    }),
  iconUrl: Joi.string()
    .uri()
    .max(500)
    .required()
    .messages({
      'string.empty': 'Icon URL cannot be empty',
      'string.uri': 'Icon URL must be a valid URL',
      'string.max': 'Icon URL cannot exceed 500 characters',
      'any.required': 'Icon URL is required'
    }),
  criteriaType: Joi.string()
    .valid(
      'courses_completed',
      'quiz_score',
      'assignment_score',
      'discussion_participation',
      'lesson_completion',
      'streak_days',
      'total_points',
      'badges_earned',
      'time_spent',
      'perfect_scores'
    )
    .required()
    .messages({
      'any.only': 'Criteria type must be a valid criteria type',
      'any.required': 'Criteria type is required'
    }),
  criteriaValue: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Criteria value must be a number',
      'number.integer': 'Criteria value must be an integer',
      'number.min': 'Criteria value must be at least 1',
      'any.required': 'Criteria value is required'
    }),
  pointsAwarded: Joi.number()
    .integer()
    .min(0)
    .max(1000)
    .required()
    .messages({
      'number.base': 'Points awarded must be a number',
      'number.integer': 'Points awarded must be an integer',
      'number.min': 'Points awarded cannot be negative',
      'number.max': 'Points awarded cannot exceed 1000',
      'any.required': 'Points awarded is required'
    }),
  difficultyLevel: Joi.string()
    .valid('bronze', 'silver', 'gold', 'platinum')
    .required()
    .messages({
      'any.only': 'Difficulty level must be one of: bronze, silver, gold, platinum',
      'any.required': 'Difficulty level is required'
    })
});

/**
 * Schema for updating a badge (all fields optional except at least one required)
 */
const updateBadgeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Badge name cannot be empty',
      'string.min': 'Badge name must be at least 3 characters long',
      'string.max': 'Badge name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .messages({
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 500 characters'
    }),
  categoryId: Joi.string()
    .pattern(uuidPattern)
    .messages({
      'string.pattern.base': 'Category ID must be a valid UUID'
    }),
  iconUrl: Joi.string()
    .uri()
    .max(500)
    .messages({
      'string.empty': 'Icon URL cannot be empty',
      'string.uri': 'Icon URL must be a valid URL',
      'string.max': 'Icon URL cannot exceed 500 characters'
    }),
  criteriaType: Joi.string()
    .valid(
      'courses_completed',
      'quiz_score',
      'assignment_score',
      'discussion_participation',
      'lesson_completion',
      'streak_days',
      'total_points',
      'badges_earned',
      'time_spent',
      'perfect_scores'
    )
    .messages({
      'any.only': 'Criteria type must be a valid criteria type'
    }),
  criteriaValue: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': 'Criteria value must be a number',
      'number.integer': 'Criteria value must be an integer',
      'number.min': 'Criteria value must be at least 1'
    }),
  pointsAwarded: Joi.number()
    .integer()
    .min(0)
    .max(1000)
    .messages({
      'number.base': 'Points awarded must be a number',
      'number.integer': 'Points awarded must be an integer',
      'number.min': 'Points awarded cannot be negative',
      'number.max': 'Points awarded cannot exceed 1000'
    }),
  difficultyLevel: Joi.string()
    .valid('bronze', 'silver', 'gold', 'platinum')
    .messages({
      'any.only': 'Difficulty level must be one of: bronze, silver, gold, platinum'
    }),
  isActive: Joi.boolean()
    .messages({
      'boolean': 'isActive must be a boolean value'
    })
}).min(1, 'At least one field must be provided for update');

/**
 * Schema for awarding badge to user
 */
const awardBadgeSchema = Joi.object({
  userId: Joi.string()
    .pattern(uuidPattern)
    .required()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
      'any.required': 'User ID is required'
    })
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  badgesQuerySchema,
  pointsHistorySchema,
  leaderboardQuerySchema,
  courseLeaderboardSchema,
  userRankSchema,
  streakCalendarSchema,
  badgeIdSchema,
  createBadgeSchema,
  updateBadgeSchema,
  awardBadgeSchema
};