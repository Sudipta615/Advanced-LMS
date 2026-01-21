const { Quiz, QuizQuestion, QuizAnswerOption, QuizAttempt, QuizResponse, Lesson, Course, Section, User, Enrollment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const AuditLogService = require('../services/AuditLogService');

class QuizController {
  
  static async createQuiz(req, res, next) {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user.id;
      
      const lesson = await Lesson.findOne({
        where: { id: lessonId },
        include: [{
          model: Section,
          as: 'section',
          include: [{
            model: Course,
            as: 'course',
            where: { id: courseId, instructor_id: userId }
          }]
        }]
      });
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found or you are not the instructor'
        });
      }
      
      const quiz = await Quiz.create({
        lesson_id: lessonId,
        ...req.body
      });
      
      await AuditLogService.log('quiz_created', userId, 'Quiz', quiz.id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const attemptsCount = await QuizAttempt.count({
        where: { quiz_id: quizId }
      });
      
      if (attemptsCount > 0 && (req.body.quiz_type || req.body.total_points)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change quiz type or total points after attempts have been made'
        });
      }
      
      await quiz.update(req.body);
      await AuditLogService.log('quiz_updated', userId, 'Quiz', quiz.id, req.body);
      
      res.json({
        success: true,
        message: 'Quiz updated successfully',
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const attemptsCount = await QuizAttempt.count({
        where: { quiz_id: quizId }
      });
      
      if (attemptsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete quiz with existing attempts'
        });
      }
      
      await quiz.destroy();
      await AuditLogService.log('quiz_deleted', userId, 'Quiz', quizId);
      
      res.json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getQuizDetails(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const questions = await QuizQuestion.findAll({
        where: { quiz_id: quizId },
        include: [{
          model: QuizAnswerOption,
          as: 'answerOptions',
          attributes: ['id', 'option_text', 'is_correct', 'display_order']
        }],
        order: [['display_order', 'ASC']]
      });
      
      res.json({
        success: true,
        data: {
          ...quiz.toJSON(),
          questions
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async publishQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const questionsCount = await QuizQuestion.count({
        where: { quiz_id: quizId }
      });
      
      if (questionsCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish quiz without questions'
        });
      }
      
      await quiz.update({ is_published: true });
      await AuditLogService.log('quiz_published', userId, 'Quiz', quizId);
      
      res.json({
        success: true,
        message: 'Quiz published successfully',
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async createQuestion(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const question = await QuizQuestion.create({
        quiz_id: quizId,
        ...req.body
      });
      
      await AuditLogService.log('quiz_question_created', userId, 'QuizQuestion', question.id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: question
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateQuestion(req, res, next) {
    try {
      const { quizId, questionId } = req.params;
      const userId = req.user.id;
      
      const question = await QuizQuestion.findOne({
        where: { id: questionId, quiz_id: quizId },
        include: [{
          model: Quiz,
          as: 'quiz',
          include: [{
            model: Lesson,
            as: 'lesson',
            include: [{
              model: Section,
              as: 'section',
              include: [{
                model: Course,
                as: 'course',
                where: { instructor_id: userId }
              }]
            }]
          }]
        }]
      });
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or you are not the instructor'
        });
      }
      
      await question.update(req.body);
      await AuditLogService.log('quiz_question_updated', userId, 'QuizQuestion', questionId, req.body);
      
      res.json({
        success: true,
        message: 'Question updated successfully',
        data: question
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteQuestion(req, res, next) {
    try {
      const { quizId, questionId } = req.params;
      const userId = req.user.id;
      
      const question = await QuizQuestion.findOne({
        where: { id: questionId, quiz_id: quizId },
        include: [{
          model: Quiz,
          as: 'quiz',
          include: [{
            model: Lesson,
            as: 'lesson',
            include: [{
              model: Section,
              as: 'section',
              include: [{
                model: Course,
                as: 'course',
                where: { instructor_id: userId }
              }]
            }]
          }]
        }]
      });
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or you are not the instructor'
        });
      }
      
      const attemptsCount = await QuizAttempt.count({
        where: { quiz_id: quizId }
      });
      
      if (attemptsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete question from quiz with existing attempts'
        });
      }
      
      await question.destroy();
      await AuditLogService.log('quiz_question_deleted', userId, 'QuizQuestion', questionId);
      
      res.json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async createAnswerOption(req, res, next) {
    try {
      const { quizId, questionId } = req.params;
      const userId = req.user.id;
      
      const question = await QuizQuestion.findOne({
        where: { id: questionId, quiz_id: quizId },
        include: [{
          model: Quiz,
          as: 'quiz',
          include: [{
            model: Lesson,
            as: 'lesson',
            include: [{
              model: Section,
              as: 'section',
              include: [{
                model: Course,
                as: 'course',
                where: { instructor_id: userId }
              }]
            }]
          }]
        }]
      });
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or you are not the instructor'
        });
      }
      
      const option = await QuizAnswerOption.create({
        question_id: questionId,
        ...req.body
      });
      
      await AuditLogService.log('quiz_option_created', userId, 'QuizAnswerOption', option.id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Answer option created successfully',
        data: option
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateAnswerOption(req, res, next) {
    try {
      const { quizId, questionId, optionId } = req.params;
      const userId = req.user.id;
      
      const option = await QuizAnswerOption.findOne({
        where: { id: optionId, question_id: questionId },
        include: [{
          model: QuizQuestion,
          as: 'question',
          where: { quiz_id: quizId },
          include: [{
            model: Quiz,
            as: 'quiz',
            include: [{
              model: Lesson,
              as: 'lesson',
              include: [{
                model: Section,
                as: 'section',
                include: [{
                  model: Course,
                  as: 'course',
                  where: { instructor_id: userId }
                }]
              }]
            }]
          }]
        }]
      });
      
      if (!option) {
        return res.status(404).json({
          success: false,
          message: 'Answer option not found or you are not the instructor'
        });
      }
      
      await option.update(req.body);
      await AuditLogService.log('quiz_option_updated', userId, 'QuizAnswerOption', optionId, req.body);
      
      res.json({
        success: true,
        message: 'Answer option updated successfully',
        data: option
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteAnswerOption(req, res, next) {
    try {
      const { quizId, questionId, optionId } = req.params;
      const userId = req.user.id;
      
      const option = await QuizAnswerOption.findOne({
        where: { id: optionId, question_id: questionId },
        include: [{
          model: QuizQuestion,
          as: 'question',
          where: { quiz_id: quizId },
          include: [{
            model: Quiz,
            as: 'quiz',
            include: [{
              model: Lesson,
              as: 'lesson',
              include: [{
                model: Section,
                as: 'section',
                include: [{
                  model: Course,
                  as: 'course',
                  where: { instructor_id: userId }
                }]
              }]
            }]
          }]
        }]
      });
      
      if (!option) {
        return res.status(404).json({
          success: false,
          message: 'Answer option not found or you are not the instructor'
        });
      }
      
      await option.destroy();
      await AuditLogService.log('quiz_option_deleted', userId, 'QuizAnswerOption', optionId);
      
      res.json({
        success: true,
        message: 'Answer option deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getQuizToTake(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId, is_published: true },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course'
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      const courseId = quiz.lesson.section.course.id;
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId, status: 'active' }
      });
      
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to take the quiz'
        });
      }
      
      const previousAttempts = await QuizAttempt.count({
        where: { user_id: userId, quiz_id: quizId }
      });
      
      if (!quiz.allow_retake && previousAttempts > 0) {
        return res.status(403).json({
          success: false,
          message: 'Quiz retakes are not allowed'
        });
      }
      
      if (previousAttempts >= quiz.max_attempts) {
        return res.status(403).json({
          success: false,
          message: `You have reached the maximum number of attempts (${quiz.max_attempts})`
        });
      }
      
      let questions = await QuizQuestion.findAll({
        where: { quiz_id: quizId },
        include: [{
          model: QuizAnswerOption,
          as: 'answerOptions',
          attributes: ['id', 'option_text', 'display_order']
        }],
        attributes: ['id', 'question_text', 'question_type', 'points', 'display_order']
      });
      
      if (quiz.randomize_questions) {
        questions = questions.sort(() => Math.random() - 0.5);
      } else {
        questions = questions.sort((a, b) => a.display_order - b.display_order);
      }
      
      if (quiz.shuffle_options) {
        questions = questions.map(q => ({
          ...q.toJSON(),
          answerOptions: q.answerOptions.sort(() => Math.random() - 0.5)
        }));
      }
      
      const attempt = await QuizAttempt.create({
        user_id: userId,
        quiz_id: quizId,
        enrollment_id: enrollment.id,
        attempt_number: previousAttempts + 1,
        started_at: new Date(),
        status: 'in_progress'
      });
      
      res.json({
        success: true,
        data: {
          attempt_id: attempt.id,
          quiz: {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            quiz_type: quiz.quiz_type,
            total_points: quiz.total_points,
            time_limit_minutes: quiz.time_limit_minutes,
            questions
          },
          attempt_number: previousAttempts + 1,
          max_attempts: quiz.max_attempts
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async submitQuiz(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { attemptId } = req.params;
      const { time_spent_seconds, answers } = req.body;
      const userId = req.user.id;
      
      const attempt = await QuizAttempt.findOne({
        where: { id: attemptId, user_id: userId, status: 'in_progress' },
        include: [{
          model: Quiz,
          as: 'quiz'
        }]
      });
      
      if (!attempt) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found or already submitted'
        });
      }
      
      const questions = await QuizQuestion.findAll({
        where: { quiz_id: attempt.quiz_id },
        include: [{
          model: QuizAnswerOption,
          as: 'answerOptions'
        }]
      });
      
      let totalScore = 0;
      let totalPoints = 0;
      let needsManualGrading = false;
      
      for (const question of questions) {
        const userAnswer = answers[question.id] || '';
        totalPoints += parseFloat(question.points);
        
        let isCorrect = null;
        let pointsEarned = null;
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          const correctOption = question.answerOptions.find(opt => opt.is_correct);
          isCorrect = correctOption && correctOption.id === userAnswer;
          pointsEarned = isCorrect ? question.points : 0;
          totalScore += pointsEarned;
        } else {
          needsManualGrading = true;
        }
        
        await QuizResponse.create({
          quiz_attempt_id: attemptId,
          question_id: question.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned
        }, { transaction });
      }
      
      const scorePercentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
      const passed = scorePercentage >= attempt.quiz.passing_score;
      
      await attempt.update({
        submitted_at: new Date(),
        time_spent_seconds,
        score: scorePercentage,
        passed: needsManualGrading ? null : passed,
        status: needsManualGrading ? 'submitted' : 'graded'
      }, { transaction });
      
      await transaction.commit();
      
      const result = {
        success: true,
        message: needsManualGrading ? 'Quiz submitted successfully. Awaiting manual grading.' : 'Quiz submitted and graded successfully',
        data: {
          attempt_id: attemptId,
          score: scorePercentage,
          passed: needsManualGrading ? null : passed,
          needs_manual_grading: needsManualGrading
        }
      };
      
      if (attempt.quiz.show_correct_answers && !needsManualGrading) {
        const responses = await QuizResponse.findAll({
          where: { quiz_attempt_id: attemptId },
          include: [{
            model: QuizQuestion,
            as: 'question',
            include: [{
              model: QuizAnswerOption,
              as: 'answerOptions'
            }]
          }]
        });
        
        result.data.responses = responses;
      }
      
      res.json(result);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  static async getAttemptDetails(req, res, next) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      
      const attempt = await QuizAttempt.findOne({
        where: { id: attemptId, user_id: userId },
        include: [{
          model: Quiz,
          as: 'quiz'
        }]
      });
      
      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found'
        });
      }
      
      const responses = await QuizResponse.findAll({
        where: { quiz_attempt_id: attemptId },
        include: [{
          model: QuizQuestion,
          as: 'question',
          include: [{
            model: QuizAnswerOption,
            as: 'answerOptions',
            attributes: attempt.quiz.show_correct_answers || attempt.status === 'graded' ? 
              ['id', 'option_text', 'is_correct', 'display_order'] : 
              ['id', 'option_text', 'display_order']
          }]
        }]
      });
      
      res.json({
        success: true,
        data: {
          attempt,
          responses
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyAttempts(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const attempts = await QuizAttempt.findAll({
        where: { user_id: userId },
        include: [{
          model: Quiz,
          as: 'quiz',
          include: [{
            model: Lesson,
            as: 'lesson',
            include: [{
              model: Section,
              as: 'section',
              include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title']
              }]
            }]
          }]
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      const total = await QuizAttempt.count({ where: { user_id: userId } });
      
      res.json({
        success: true,
        data: attempts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyAttemptsForQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quizId, user_id: userId },
        order: [['attempt_number', 'DESC']]
      });
      
      res.json({
        success: true,
        data: attempts
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getQuizAttempts(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quizId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']]
      });
      
      const total = await QuizAttempt.count({ where: { quiz_id: quizId } });
      
      res.json({
        success: true,
        data: attempts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getQuizResponse(req, res, next) {
    try {
      const { responseId } = req.params;
      const userId = req.user.id;
      
      const response = await QuizResponse.findOne({
        where: { id: responseId },
        include: [{
          model: QuizAttempt,
          as: 'attempt',
          include: [{
            model: Quiz,
            as: 'quiz',
            include: [{
              model: Lesson,
              as: 'lesson',
              include: [{
                model: Section,
                as: 'section',
                include: [{
                  model: Course,
                  as: 'course',
                  where: { instructor_id: userId }
                }]
              }]
            }]
          }]
        }, {
          model: QuizQuestion,
          as: 'question'
        }]
      });
      
      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Response not found or you are not the instructor'
        });
      }
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async gradeResponse(req, res, next) {
    try {
      const { responseId } = req.params;
      const { is_correct, points_earned, instructor_feedback } = req.body;
      const userId = req.user.id;
      
      const response = await QuizResponse.findOne({
        where: { id: responseId },
        include: [{
          model: QuizAttempt,
          as: 'attempt',
          include: [{
            model: Quiz,
            as: 'quiz',
            include: [{
              model: Lesson,
              as: 'lesson',
              include: [{
                model: Section,
                as: 'section',
                include: [{
                  model: Course,
                  as: 'course',
                  where: { instructor_id: userId }
                }]
              }]
            }]
          }]
        }]
      });
      
      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Response not found or you are not the instructor'
        });
      }
      
      await response.update({
        is_correct,
        points_earned,
        instructor_feedback,
        graded_at: new Date(),
        graded_by: userId
      });
      
      const allResponses = await QuizResponse.findAll({
        where: { quiz_attempt_id: response.quiz_attempt_id },
        include: [{
          model: QuizQuestion,
          as: 'question'
        }]
      });
      
      const allGraded = allResponses.every(r => r.points_earned !== null);
      
      if (allGraded) {
        const totalPoints = allResponses.reduce((sum, r) => sum + parseFloat(r.question.points), 0);
        const earnedPoints = allResponses.reduce((sum, r) => sum + parseFloat(r.points_earned || 0), 0);
        const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const passed = scorePercentage >= response.attempt.quiz.passing_score;
        
        await response.attempt.update({
          score: scorePercentage,
          passed,
          status: 'graded'
        });
      }
      
      await AuditLogService.log('quiz_response_graded', userId, 'QuizResponse', responseId, req.body);
      
      res.json({
        success: true,
        message: 'Response graded successfully',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getQuizAnalytics(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Section,
            as: 'section',
            include: [{
              model: Course,
              as: 'course',
              where: { instructor_id: userId }
            }]
          }]
        }]
      });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or you are not the instructor'
        });
      }
      
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quizId, status: 'graded' },
        attributes: ['score', 'passed', 'time_spent_seconds']
      });
      
      const totalAttempts = attempts.length;
      const averageScore = totalAttempts > 0 ? 
        attempts.reduce((sum, a) => sum + parseFloat(a.score), 0) / totalAttempts : 0;
      const passRate = totalAttempts > 0 ?
        (attempts.filter(a => a.passed).length / totalAttempts) * 100 : 0;
      
      const scoreDistribution = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      };
      
      attempts.forEach(a => {
        const score = parseFloat(a.score);
        if (score <= 20) scoreDistribution['0-20']++;
        else if (score <= 40) scoreDistribution['21-40']++;
        else if (score <= 60) scoreDistribution['41-60']++;
        else if (score <= 80) scoreDistribution['61-80']++;
        else scoreDistribution['81-100']++;
      });
      
      res.json({
        success: true,
        data: {
          total_attempts: totalAttempts,
          average_score: Math.round(averageScore * 100) / 100,
          pass_rate: Math.round(passRate * 100) / 100,
          score_distribution: scoreDistribution
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuizController;
