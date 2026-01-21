const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  registerSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
  verifyEmailSchema
} = require('../validators/authValidators');
const {
  registerLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailVerificationLimiter
} = require('../middleware/rateLimiter');

router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/verify-email',
  emailVerificationLimiter,
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);


router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequest(emailSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser
);

module.exports = router;
