const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const registerLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many registration attempts, please try again after 15 minutes'
);

const loginLimiter = createRateLimiter(
  5 * 60 * 1000,
  5,
  'Too many login attempts, please try again after 5 minutes'
);

const passwordResetLimiter = createRateLimiter(
  15 * 60 * 1000,
  3,
  'Too many password reset requests, please try again after 15 minutes'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests, please try again later'
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
  generalLimiter,
  adminLimiter
};
