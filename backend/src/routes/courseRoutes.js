const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createCourseSchema,
  updateCourseSchema,
  createSectionSchema,
  updateSectionSchema,
  createLessonSchema,
  updateLessonSchema
} = require('../validators/courseValidators');

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes - require authentication
router.use(authenticateToken);

// Course management routes (instructor/admin only)
router.post(
  '/',
  checkRole(['instructor', 'admin']),
  validateRequest(createCourseSchema),
  courseController.createCourse
);

router.put(
  '/:id',
  checkRole(['instructor', 'admin']),
  validateRequest(updateCourseSchema),
  courseController.updateCourse
);

router.delete(
  '/:id',
  checkRole(['instructor', 'admin']),
  courseController.deleteCourse
);

// Section routes
router.get('/:id/sections', courseController.getCourseSections);

router.post(
  '/:id/sections',
  checkRole(['instructor', 'admin']),
  validateRequest(createSectionSchema),
  courseController.createSection
);

router.put(
  '/:id/sections/:sectionId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateSectionSchema),
  courseController.updateSection
);

router.delete(
  '/:id/sections/:sectionId',
  checkRole(['instructor', 'admin']),
  courseController.deleteSection
);

// Lesson routes
router.get('/lessons/:id', courseController.getLessonById);

router.post(
  '/:id/sections/:sectionId/lessons',
  checkRole(['instructor', 'admin']),
  validateRequest(createLessonSchema),
  courseController.createLesson
);

router.put(
  '/lessons/:id',
  checkRole(['instructor', 'admin']),
  validateRequest(updateLessonSchema),
  courseController.updateLesson
);

router.delete(
  '/lessons/:id',
  checkRole(['instructor', 'admin']),
  courseController.deleteLesson
);

module.exports = router;