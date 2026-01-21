const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const certificateTemplateController = require('../controllers/certificateTemplateController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');

// Public certificate verification (no authentication required)
router.get('/certificates/verify/:verificationToken', certificateController.verifyCertificate);

// Protected routes
router.use(authenticateToken);

router.post('/enrollments/:enrollmentId/certificate', certificateController.generateCertificate);
router.get('/certificates', certificateController.getMyCertificates);
router.get('/certificates/:certificateId', certificateController.getCertificate);

// Certificate Templates (Admin/Instructor)
router.post(
  '/certificate-templates',
  checkRole(['admin', 'instructor']),
  certificateTemplateController.createTemplate
);

router.put(
  '/certificate-templates/:templateId',
  checkRole(['admin', 'instructor']),
  certificateTemplateController.updateTemplate
);

router.delete(
  '/certificate-templates/:templateId',
  checkRole(['admin']),
  certificateTemplateController.deleteTemplate
);

router.get('/certificate-templates', certificateTemplateController.listTemplates);

module.exports = router;
