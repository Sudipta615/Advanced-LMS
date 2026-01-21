const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message, keyGenerator) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => req.ip)
  });
};

// --- Auth Limiters ---

const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many registration attempts, please try again after an hour'
);

const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many login attempts, please try again after 15 minutes'
);

const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset requests, please try again after an hour'
);

const emailVerificationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  'Too many email verification attempts, please try again after an hour'
);

// --- General & API Limiters ---

const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests, please try again later'
);

const apiLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  1000,
  'Hourly API rate limit exceeded',
  (req) => req.user ? req.user.id : req.ip
);

// --- Endpoint Specific Limiters ---

const quizSubmissionLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many quiz submissions, please try again after an hour',
  (req) => req.user ? req.user.id : req.ip
);

const assignmentSubmissionLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  'Too many assignment submissions, please try again after an hour',
  (req) => req.user ? req.user.id : req.ip
);

const forumPostLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  20,
  'Too many forum posts, please try again after an hour',
  (req) => req.user ? req.user.id : req.ip
);

const fileUploadLimiter = createRateLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  50,
  'Daily file upload limit reached',
  (req) => req.user ? req.user.id : req.ip
);

const adminLimiter = createRateLimiter(
  5 * 60 * 1000,
  20,
  'Too many admin operations, please try again after 5 minutes'
);

module.exports = {
  registerLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  generalLimiter,
  apiLimiter,
  quizSubmissionLimiter,
  assignmentSubmissionLimiter,
  forumPostLimiter,
  fileUploadLimiter,
  adminLimiter
};
