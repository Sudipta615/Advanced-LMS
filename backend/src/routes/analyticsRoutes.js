const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

// Student Analytics
router.get('/student/dashboard', checkRole(['student']), analyticsController.getStudentDashboard);
router.get('/student/progress', checkRole(['student']), analyticsController.getStudentProgress);

// Instructor Analytics
router.get('/instructor/dashboard', checkRole(['instructor', 'admin']), analyticsController.getInstructorDashboard);
router.get('/instructor/courses', checkRole(['instructor', 'admin']), analyticsController.getInstructorCourseAnalytics);
router.get('/instructor/students/:courseId', checkRole(['instructor', 'admin']), analyticsController.getCourseStudentProgress);

module.exports = router;
