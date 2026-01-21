const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerOptionSchema,
  updateAnswerOptionSchema,
  submitQuizSchema,
  gradeResponseSchema
} = require('../validators/quizValidators');

router.use(authenticateToken);

// Quiz Management (Instructor)
router.post(
  '/courses/:courseId/lessons/:lessonId/quizzes',
  checkRole(['instructor', 'admin']),
  validateRequest(createQuizSchema),
  quizController.createQuiz
);

router.get(
  '/quiz-attempts',
  quizController.getMyAttempts
);

router.get(
  '/quiz-attempts/:attemptId',
  quizController.getAttemptDetails
);

router.post(
  '/quiz-attempts/:attemptId/submit',
  checkRole(['student', 'instructor', 'admin']),
  validateRequest(submitQuizSchema),
  quizController.submitQuiz
);

router.get(
  '/quizzes/:quizId/my-attempts',
  quizController.getMyAttemptsForQuiz
);

router.get(
  '/quizzes/:quizId/take',
  checkRole(['student', 'instructor', 'admin']),
  quizController.getQuizToTake
);

router.get(
  '/quizzes/:quizId/attempts',
  checkRole(['instructor', 'admin']),
  quizController.getQuizAttempts
);

router.get(
  '/quizzes/:quizId/analytics',
  checkRole(['instructor', 'admin']),
  quizController.getQuizAnalytics
);

router.put(
  '/quizzes/:quizId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateQuizSchema),
  quizController.updateQuiz
);

router.delete(
  '/quizzes/:quizId',
  checkRole(['instructor', 'admin']),
  quizController.deleteQuiz
);

router.get(
  '/quizzes/:quizId',
  checkRole(['instructor', 'admin']),
  quizController.getQuizDetails
);

router.post(
  '/quizzes/:quizId/publish',
  checkRole(['instructor', 'admin']),
  quizController.publishQuiz
);

router.post(
  '/quizzes/:quizId/questions',
  checkRole(['instructor', 'admin']),
  validateRequest(createQuestionSchema),
  quizController.createQuestion
);

router.put(
  '/quizzes/:quizId/questions/:questionId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateQuestionSchema),
  quizController.updateQuestion
);

router.delete(
  '/quizzes/:quizId/questions/:questionId',
  checkRole(['instructor', 'admin']),
  quizController.deleteQuestion
);

router.post(
  '/quizzes/:quizId/questions/:questionId/options',
  checkRole(['instructor', 'admin']),
  validateRequest(createAnswerOptionSchema),
  quizController.createAnswerOption
);

router.put(
  '/quizzes/:quizId/questions/:questionId/options/:optionId',
  checkRole(['instructor', 'admin']),
  validateRequest(updateAnswerOptionSchema),
  quizController.updateAnswerOption
);

router.delete(
  '/quizzes/:quizId/questions/:questionId/options/:optionId',
  checkRole(['instructor', 'admin']),
  quizController.deleteAnswerOption
);

router.get(
  '/quiz-responses/:responseId',
  checkRole(['instructor', 'admin']),
  quizController.getQuizResponse
);

router.put(
  '/quiz-responses/:responseId/grade',
  checkRole(['instructor', 'admin']),
  validateRequest(gradeResponseSchema),
  quizController.gradeResponse
);

module.exports = router;
