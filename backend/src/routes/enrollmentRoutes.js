const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  enrollCourseSchema,
  completeLessonSchema
} = require('../validators/courseValidators');

// All enrollment routes require authentication
router.use(authenticateToken);

// Enrollment routes
router.post(
  '/',
  validateRequest(enrollCourseSchema),
  enrollmentController.enrollCourse
);

router.get('/', enrollmentController.getMyEnrollments);
router.get('/:id', enrollmentController.getEnrollment);
router.put('/:id', enrollmentController.updateEnrollment);
router.delete('/:id', enrollmentController.unenrollCourse);

// Progress routes
router.post(
  '/lessons/:id/complete',
  validateRequest(completeLessonSchema),
  enrollmentController.completeLesson
);

router.get('/courses/:id/progress', enrollmentController.getCourseProgress);
router.get('/:id/progress', enrollmentController.getEnrollmentProgress);

// Analytics routes (instructor/admin only)
router.get(
  '/courses/:id/analytics',
  checkRole(['instructor', 'admin']),
  enrollmentController.getCourseAnalytics
);

module.exports = router;