const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema
} = require('../validators/assignmentValidators');

router.use(authenticateToken);

// Assignment Management (Instructor)
router.post(
  '/courses/:courseId/lessons/:lessonId/assignments',
  checkRole(['instructor', 'admin']),
  validateRequest(createAssignmentSchema),
  assignmentController.createAssignment
);

router.put(
  '/assignments/:assignmentId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateAssignmentSchema),
  assignmentController.updateAssignment
);

router.delete(
  '/assignments/:assignmentId',
  checkRole(['instructor', 'admin']),
  assignmentController.deleteAssignment
);

router.get(
  '/assignments/:assignmentId',
  assignmentController.getAssignmentDetails
);

router.post(
  '/assignments/:assignmentId/submit',
  checkRole(['student', 'instructor', 'admin']),
  upload.array('files', 5),
  validateRequest(submitAssignmentSchema),
  assignmentController.submitAssignment
);

router.get(
  '/assignments/:assignmentId/my-submissions',
  assignmentController.getMySubmissions
);

router.get(
  '/assignments/:assignmentId/submissions',
  checkRole(['instructor', 'admin']),
  assignmentController.getSubmissions
);

router.put(
  '/assignments/:assignmentId/submissions/:submissionId/grade',
  checkRole(['instructor', 'admin']),
  validateRequest(gradeSubmissionSchema),
  assignmentController.gradeSubmission
);

router.get(
  '/assignments/:assignmentId/analytics',
  checkRole(['instructor', 'admin']),
  assignmentController.getAssignmentAnalytics
);

module.exports = router;
