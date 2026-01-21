const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);
router.use(checkRole(['admin']));

router.get('/overview', analyticsController.getAdminOverview);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/courses', analyticsController.getCourseAnalytics);

module.exports = router;
