const { Enrollment, Course, User, Lesson, LessonCompletion, CoursePrerequisite, Section } = require('../models');
const { sequelize, Op } = require('sequelize');
const AuditLogService = require('../services/AuditLogService');
const { CacheManager, CACHE_TTL, CACHE_KEYS } = require('../utils/cacheManager');

class EnrollmentController {
  
  // Enroll in a course
  static async enrollCourse(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { course_id } = req.body;
      const userId = req.user.id;
      
      // Check if course exists and is published
      const course = await Course.findOne({
        where: { id: course_id, status: 'published' }
      });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found or not available for enrollment'
        });
      }
      
      // Check if user already enrolled
      const existingEnrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: course.id }
      });
      
      if (existingEnrollment) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'You are already enrolled in this course'
        });
      }
      
      // Check prerequisites
      const prerequisites = await CoursePrerequisite.findAll({
        where: { course_id: course.id }
      });
      
      for (const prerequisite of prerequisites) {
        const prerequisiteCourse = await Course.findOne({
          where: { id: prerequisite.prerequisite_course_id }
        });
        
        if (!prerequisiteCourse) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Prerequisite course not found: ${prerequisite.prerequisite_course_id}`
          });
        }
        
        const prerequisiteEnrollment = await Enrollment.findOne({
          where: { user_id: userId, course_id: prerequisite.prerequisite_course_id }
        });
        
        if (!prerequisiteEnrollment) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `You must complete the prerequisite course: ${prerequisiteCourse.title}`
          });
        }
        
        if (prerequisiteEnrollment.completion_percentage < prerequisite.min_completion_percentage) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `You must complete at least ${prerequisite.min_completion_percentage}% of the prerequisite course: ${prerequisiteCourse.title}`
          });
        }
      }
      
      // Create enrollment
      const enrollment = await Enrollment.create({
        user_id: userId,
        course_id: course.id,
        status: 'active',
        completion_percentage: 0
      }, { transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'enrollment:create', 'Enrollment', enrollment.id, { course_id: course.id }, req.ip, req.headers['user-agent']);
      
      // Invalidate caches
      await CacheManager.invalidateEnrollmentCache(userId, course.id);
      
      res.status(201).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Get user's enrollments
  static async getMyEnrollments(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const userId = req.user.id;
      
      // Try cache (only cache first page without status filter)
      const cacheKey = CACHE_KEYS.USER_ENROLLMENTS(userId);
      const shouldCache = page == 1 && !status;
      
      if (shouldCache) {
        const cached = await CacheManager.get(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      }
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const where = { user_id: userId };
      
      if (status) {
        where.status = status;
      }
      
      // Optimize: Get count and enrollments in parallel
      const [total, enrollments] = await Promise.all([
        Enrollment.count({ where }),
        Enrollment.findAll({
          where,
          include: [{
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'slug', 'thumbnail_url', 'difficulty_level', 'instructor_id', 'category_id'],
            include: [
              { 
                model: User, 
                as: 'instructor', 
                attributes: ['id', 'first_name', 'last_name']
              },
              {
                model: require('../models').Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
              }
            ]
          }],
          attributes: ['id', 'user_id', 'course_id', 'status', 'completion_percentage', 'enrolled_at', 'completed_at', 'last_accessed_at', 'created_at'],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        })
      ]);
      
      const response = {
        success: true,
        data: enrollments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
      
      // Cache the response
      if (shouldCache) {
        await CacheManager.set(cacheKey, response, CACHE_TTL.USER_ENROLLMENTS);
      }
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get enrollment by ID
  static async getEnrollment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const enrollment = await Enrollment.findOne({
        where: { id, user_id: userId },
        include: [{
          model: Course,
          as: 'course',
          include: [
            {
              model: Section,
              as: 'sections',
              include: [{
                model: Lesson,
                as: 'lessons'
              }]
            },
            { model: User, as: 'instructor', attributes: ['id', 'first_name', 'last_name'] },
            'category'
          ]
        }]
      });
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }
      
      // Add lesson completion status
      const lessonCompletions = await LessonCompletion.findAll({
        where: { enrollment_id: enrollment.id }
      });
      
      const courseData = {
        ...enrollment.course.toJSON(),
        sections: enrollment.course.sections.map(section => {
          const lessonsWithStatus = section.lessons.map(lesson => {
            const completion = lessonCompletions.find(lc => lc.lesson_id === lesson.id);
            return {
              ...lesson.toJSON(),
              isCompleted: !!completion,
              completed_at: completion ? completion.completed_at : null,
              time_spent_minutes: completion ? completion.time_spent_minutes : 0,
              notes: completion ? completion.notes : null
            };
          });
          
          return {
            ...section.toJSON(),
            lessons: lessonsWithStatus
          };
        })
      };
      
      const enrollmentData = {
        ...enrollment.toJSON(),
        course: courseData
      };
      
      res.json({
        success: true,
        data: enrollmentData
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Update enrollment (e.g., last accessed)
  static async updateEnrollment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const enrollment = await Enrollment.findOne({
        where: { id, user_id: userId }
      });
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }
      
      const updatedEnrollment = await enrollment.update({
        last_accessed_at: new Date()
      });
      
      res.json({
        success: true,
        data: updatedEnrollment
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Unenroll from a course
  static async unenrollCourse(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const enrollment = await Enrollment.findOne({
        where: { id, user_id: userId }
      });
      
      if (!enrollment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }
      
      // Soft delete the enrollment
      await enrollment.destroy({ transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'enrollment:delete', 'Enrollment', enrollment.id, { course_id: enrollment.course_id }, req.ip, req.headers['user-agent']);
      
      // Invalidate caches
      await CacheManager.invalidateEnrollmentCache(userId, enrollment.course_id);
      
      res.json({
        success: true,
        message: 'Successfully unenrolled from the course'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Mark lesson as complete
  static async completeLesson(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params; // lesson_id
      const { time_spent_minutes = 0, notes = '' } = req.body;
      const userId = req.user.id;
      
      const lesson = await Lesson.findOne({
        where: { id },
        include: [{
          model: Section,
          as: 'section',
          include: [{
            model: Course,
            as: 'course'
          }]
        }]
      });
      
      if (!lesson) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      
      // Check if user is enrolled in the course
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: lesson.section.course_id }
      });
      
      if (!enrollment) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      
      // Check if lesson already completed
      const existingCompletion = await LessonCompletion.findOne({
        where: { user_id: userId, lesson_id: lesson.id, enrollment_id: enrollment.id }
      });
      
      if (existingCompletion) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'Lesson already marked as complete'
        });
      }
      
      // Create lesson completion
      const lessonCompletion = await LessonCompletion.create({
        user_id: userId,
        lesson_id: lesson.id,
        enrollment_id: enrollment.id,
        time_spent_minutes,
        notes
      }, { transaction });
      
      // Update enrollment completion percentage
      const totalLessons = await Lesson.count({
        where: { section_id: lesson.section_id }
      });
      
      const completedLessons = await LessonCompletion.count({
        where: { enrollment_id: enrollment.id }
      });
      
      const course = await Course.findOne({
        where: { id: lesson.section.course_id }
      });
      
      const allCourseLessons = await Lesson.count({
        include: [{
          model: Section,
          as: 'section',
          where: { course_id: course.id }
        }]
      });
      
      const allCompletedLessons = await LessonCompletion.count({
        where: { enrollment_id: enrollment.id }
      });
      
      const sectionCompletionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const courseCompletionPercentage = allCourseLessons > 0 ? (allCompletedLessons / allCourseLessons) * 100 : 0;
      
      await enrollment.update({
        completion_percentage: courseCompletionPercentage,
        status: courseCompletionPercentage >= 100 ? 'completed' : 'active',
        completed_at: courseCompletionPercentage >= 100 ? new Date() : null
      }, { transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'lesson:complete', 'LessonCompletion', lessonCompletion.id, { lesson_id: lesson.id, enrollment_id: enrollment.id }, req.ip, req.headers['user-agent']);
      
      // Invalidate caches
      await CacheManager.invalidateEnrollmentCache(userId, lesson.section.course_id);
      
      res.json({
        success: true,
        data: {
          lessonCompletion,
          enrollment: {
            completion_percentage: courseCompletionPercentage,
            status: courseCompletionPercentage >= 100 ? 'completed' : 'active'
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Get course progress for authenticated user
  static async getCourseProgress(req, res, next) {
    try {
      const { id } = req.params; // course_id
      const userId = req.user.id;
      
      const course = await Course.findOne({
        where: { id },
        include: [{
          model: Section,
          as: 'sections',
          include: [{
            model: Lesson,
            as: 'lessons'
          }]
        }]
      });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if user is enrolled
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: course.id }
      });
      
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      
      // Get all lesson completions
      const lessonCompletions = await LessonCompletion.findAll({
        where: { enrollment_id: enrollment.id }
      });
      
      // Calculate progress
      const totalLessons = course.sections.reduce((total, section) => total + section.lessons.length, 0);
      const completedLessons = lessonCompletions.length;
      const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      // Calculate estimated time remaining
      const completedTime = lessonCompletions.reduce((total, completion) => total + completion.time_spent_minutes, 0);
      const averageTimePerLesson = completedLessons > 0 ? completedTime / completedLessons : 0;
      const estimatedTimeRemaining = (totalLessons - completedLessons) * averageTimePerLesson;
      
      // Get section progress
      const sectionsProgress = course.sections.map(section => {
        const sectionLessons = section.lessons.length;
        const sectionCompleted = lessonCompletions.filter(lc => 
          section.lessons.some(lesson => lesson.id === lc.lesson_id)
        ).length;
        const sectionPercentage = sectionLessons > 0 ? (sectionCompleted / sectionLessons) * 100 : 0;
        
        return {
          section_id: section.id,
          title: section.title,
          completion_percentage: sectionPercentage,
          completed_lessons: sectionCompleted,
          total_lessons: sectionLessons
        };
      });
      
      res.json({
        success: true,
        data: {
          course_id: course.id,
          course_title: course.title,
          completion_percentage: completionPercentage,
          completed_lessons: completedLessons,
          total_lessons: totalLessons,
          estimated_time_remaining_minutes: estimatedTimeRemaining,
          sections: sectionsProgress,
          enrollment_status: enrollment.status,
          enrolled_at: enrollment.enrolled_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get enrollment progress details
  static async getEnrollmentProgress(req, res, next) {
    try {
      const { id } = req.params; // enrollment_id
      const userId = req.user.id;
      
      const enrollment = await Enrollment.findOne({
        where: { id, user_id: userId },
        include: [{
          model: Course,
          as: 'course',
          include: [{
            model: Section,
            as: 'sections',
            include: [{
              model: Lesson,
              as: 'lessons'
            }]
          }]
        }]
      });
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }
      
      // Get all lesson completions
      const lessonCompletions = await LessonCompletion.findAll({
        where: { enrollment_id: enrollment.id }
      });
      
      // Map lesson completions
      const lessonsWithProgress = [];
      
      for (const section of enrollment.course.sections) {
        for (const lesson of section.lessons) {
          const completion = lessonCompletions.find(lc => lc.lesson_id === lesson.id);
          
          lessonsWithProgress.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            section_id: section.id,
            section_title: section.title,
            is_completed: !!completion,
            completed_at: completion ? completion.completed_at : null,
            time_spent_minutes: completion ? completion.time_spent_minutes : 0,
            notes: completion ? completion.notes : null,
            lesson_type: lesson.lesson_type,
            display_order: lesson.display_order
          });
        }
      }
      
      res.json({
        success: true,
        data: {
          enrollment_id: enrollment.id,
          course_id: enrollment.course.id,
          course_title: enrollment.course.title,
          completion_percentage: enrollment.completion_percentage,
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          last_accessed_at: enrollment.last_accessed_at,
          lessons: lessonsWithProgress
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get course analytics (for instructors)
  static async getCourseAnalytics(req, res, next) {
    try {
      const { id } = req.params; // course_id
      
      const course = await Course.findOne({
        where: { id },
        include: [{
          model: User,
          as: 'instructor'
        }]
      });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view analytics for this course'
        });
      }
      
      // Get enrollment statistics
      const totalEnrollments = await Enrollment.count({
        where: { course_id: course.id }
      });
      
      const completedEnrollments = await Enrollment.count({
        where: { course_id: course.id, status: 'completed' }
      });
      
      const activeEnrollments = await Enrollment.count({
        where: { course_id: course.id, status: 'active' }
      });
      
      const droppedEnrollments = await Enrollment.count({
        where: { course_id: course.id, status: 'dropped' }
      });
      
      // Calculate completion rate
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
      
      // Get average completion percentage
      const enrollments = await Enrollment.findAll({
        where: { course_id: course.id },
        attributes: ['completion_percentage']
      });
      
      const averageCompletion = enrollments.length > 0 ? 
        enrollments.reduce((sum, e) => sum + e.completion_percentage, 0) / enrollments.length : 0;
      
      // Get recent enrollments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEnrollments = await Enrollment.count({
        where: {
          course_id: course.id,
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      });
      
      res.json({
        success: true,
        data: {
          course_id: course.id,
          course_title: course.title,
          total_enrollments: totalEnrollments,
          completed_enrollments: completedEnrollments,
          active_enrollments: activeEnrollments,
          dropped_enrollments: droppedEnrollments,
          completion_rate: completionRate,
          average_completion_percentage: averageCompletion,
          recent_enrollments: recentEnrollments,
          enrollment_trend: {
            last_30_days: recentEnrollments
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EnrollmentController;