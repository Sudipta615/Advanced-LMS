const { Course, Category, Section, Lesson, User, Enrollment, LessonCompletion, CoursePrerequisite, CourseTag, CourseApproval } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const AuditLogService = require('../services/AuditLogService');
const SystemSettingsService = require('../services/systemSettingsService');
const { CacheManager, CACHE_TTL, CACHE_KEYS } = require('../utils/cacheManager');

class CourseController {
  
  // Get all courses with pagination and filtering
  static async getAllCourses(req, res, next) {
    try {
      const { page = 1, limit = 10, search, category, difficulty, tags, status } = req.query;
      
      // Create cache key (only cache for non-authenticated users or published courses)
      const cacheKey = CACHE_KEYS.COURSES_LIST(page, limit, search || '');
      const shouldCache = !req.user || (!status && !tags); // Don't cache filtered/user-specific results
      
      // Try to get from cache
      if (shouldCache) {
        const cached = await CacheManager.get(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      }
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const where = { status: 'published' };
      
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }
      
      // Fix N+1: Get category by slug without separate query
      if (category) {
        const categoryRecord = await Category.findOne({ 
          where: { slug: category },
          attributes: ['id']
        });
        if (categoryRecord) {
          where.category_id = categoryRecord.id;
        }
      }
      
      if (difficulty) {
        where.difficulty_level = difficulty;
      }
      
      if (status && req.user && req.user.role.name === 'admin') {
        where.status = status;
      }
      
      // Optimize: Get total count and courses in parallel
      const [total, courses] = await Promise.all([
        Course.count({ where }),
        Course.findAll({
          where,
          include: [
            { 
              model: Category, 
              as: 'category',
              attributes: ['id', 'name', 'slug']
            },
            { 
              model: User, 
              as: 'instructor', 
              attributes: ['id', 'first_name', 'last_name']
            }
          ],
          attributes: [
            'id', 'title', 'description', 'slug', 'thumbnail_url',
            'difficulty_level', 'status', 'estimated_duration',
            'created_at', 'updated_at', 'instructor_id', 'category_id'
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        })
      ]);
      
      // Add enrollment status if user is authenticated
      let coursesData = courses;
      if (req.user) {
        const userId = req.user.id;
        const courseIds = courses.map(c => c.id);
        
        // Optimize: Get all enrollments in one query
        const enrollments = courseIds.length > 0 ? await Enrollment.findAll({
          where: { 
            user_id: userId, 
            course_id: { [Op.in]: courseIds }
          },
          attributes: ['course_id', 'status', 'completion_percentage'],
          raw: true
        }) : [];
        
        // Create enrollment map for O(1) lookup
        const enrollmentMap = new Map(
          enrollments.map(e => [e.course_id, e])
        );
        
        coursesData = courses.map(course => {
          const courseJson = course.toJSON();
          const enrollment = enrollmentMap.get(course.id);
          return {
            ...courseJson,
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment ? enrollment.status : null,
            completionPercentage: enrollment ? enrollment.completion_percentage : 0
          };
        });
      } else {
        coursesData = courses.map(c => c.toJSON());
      }
      
      const response = {
        success: true,
        data: coursesData,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
      
      // Cache the response (only for unauthenticated users)
      if (shouldCache && !req.user) {
        await CacheManager.set(cacheKey, response, CACHE_TTL.COURSES_LIST);
      }
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get course by ID
  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Try cache for course details (without user-specific data)
      const cacheKey = CACHE_KEYS.COURSE_DETAILS(id);
      let courseData = await CacheManager.get(cacheKey);
      
      if (!courseData) {
        // Optimize: Get course with all related data in one query
        const course = await Course.findOne({
          where: { id },
          include: [
            { 
              model: Category, 
              as: 'category',
              attributes: ['id', 'name', 'slug']
            },
            { 
              model: User, 
              as: 'instructor', 
              attributes: ['id', 'first_name', 'last_name', 'profile_picture_url']
            },
            {
              model: Section,
              as: 'sections',
              attributes: ['id', 'title', 'description', 'display_order', 'course_id'],
              include: [{
                model: Lesson,
                as: 'lessons',
                attributes: ['id', 'title', 'description', 'lesson_type', 'content_url', 'duration_minutes', 'display_order', 'section_id']
              }],
              order: [['display_order', 'ASC']]
            }
          ],
          order: [
            [{ model: Section, as: 'sections' }, 'display_order', 'ASC'],
            [{ model: Section, as: 'sections' }, { model: Lesson, as: 'lessons' }, 'display_order', 'ASC']
          ]
        });
        
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Course not found'
          });
        }
        
        // Check if course is published or user has permission
        if (course.status !== 'published' && (!req.user || (req.user.id !== course.instructor_id && req.user.role.name !== 'admin'))) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
        
        // Optimize: Get prerequisites and tags in parallel
        const [prerequisites, tags] = await Promise.all([
          CoursePrerequisite.findAll({
            where: { course_id: course.id },
            include: [{
              model: Course,
              as: 'prerequisite_course',
              attributes: ['id', 'title', 'slug']
            }],
            attributes: ['prerequisite_course_id', 'min_completion_percentage']
          }),
          CourseTag.findAll({
            where: { course_id: course.id },
            attributes: ['tag'],
            raw: true
          })
        ]);
        
        courseData = {
          ...course.toJSON(),
          prerequisites: prerequisites.map(p => ({
            course_id: p.prerequisite_course_id,
            title: p.prerequisite_course.title,
            slug: p.prerequisite_course.slug,
            min_completion_percentage: p.min_completion_percentage
          })),
          tags: tags.map(t => t.tag)
        };
        
        // Cache course data (without user-specific enrollment info)
        await CacheManager.set(cacheKey, courseData, CACHE_TTL.COURSE_DETAILS);
      }
      
      // Add enrollment status if user is authenticated (not cached)
      let enrollmentStatus = null;
      let completionPercentage = 0;
      let isEnrolled = false;
      
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          where: { user_id: req.user.id, course_id: id },
          attributes: ['status', 'completion_percentage'],
          raw: true
        });
        
        if (enrollment) {
          isEnrolled = true;
          enrollmentStatus = enrollment.status;
          completionPercentage = enrollment.completion_percentage;
        }
      }
      
      res.json({
        success: true,
        data: {
          ...courseData,
          isEnrolled,
          enrollmentStatus,
          completionPercentage
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create a new course
  static async createCourse(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { title, description, category_id, ...rest } = req.body;
      const userId = req.user.id;
      
      // Check if user has instructor or admin role
      if (req.user.role.name !== 'instructor' && req.user.role.name !== 'admin') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'Only instructors and admins can create courses'
        });
      }
      
      // Create course
      const course = await Course.create({
        title,
        description,
        category_id,
        instructor_id: userId,
        created_by: userId,
        updated_by: userId,
        ...rest
      }, { transaction });
      
      // Create tags
      if (rest.tags && rest.tags.length > 0) {
        const tags = rest.tags.map(tag => ({
          course_id: course.id,
          tag
        }));
        await CourseTag.bulkCreate(tags, { transaction });
      }
      
      // Create prerequisites
      if (rest.prerequisites && rest.prerequisites.length > 0) {
        const prerequisites = rest.prerequisites.map(prerequisite_id => ({
          course_id: course.id,
          prerequisite_course_id: prerequisite_id,
          min_completion_percentage: 100 // default
        }));
        await CoursePrerequisite.bulkCreate(prerequisites, { transaction });
      }
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'course:create', 'Course', course.id, { title: course.title }, req.ip, req.headers['user-agent']);
      
      // Invalidate course caches
      await CacheManager.invalidateCourseCache();
      
      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Update a course
  static async updateCourse(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { title, description, category_id, ...rest } = req.body;
      const userId = req.user.id;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this course'
        });
      }

      const requireApproval = await SystemSettingsService.getSettingValue('courses.require_approval', false);
      const roleName = req.user.role?.name || req.user.role;
      let submittedForApproval = false;

      if (requireApproval && roleName !== 'admin' && rest.status === 'published') {
        submittedForApproval = true;
        rest.status = 'draft';
        rest.published_at = null;

        const existing = await CourseApproval.findOne({
          where: { course_id: course.id, status: 'pending' },
          transaction
        });

        if (existing) {
          existing.submitted_by = userId;
          existing.submitted_at = new Date();
          existing.reviewer_id = null;
          existing.reviewer_comments = null;
          existing.reviewed_at = null;
          await existing.save({ transaction });
        } else {
          await CourseApproval.create({
            course_id: course.id,
            submitted_by: userId,
            status: 'pending',
            submitted_at: new Date()
          }, { transaction });
        }
      }
      
      // Update course
      const oldData = { ...course.toJSON() };
      const updatedCourse = await course.update({
        title,
        description,
        category_id,
        updated_by: userId,
        ...rest
      }, { transaction });
      
      // Update tags
      if (rest.tags) {
        await CourseTag.destroy({ where: { course_id: course.id }, transaction });
        const tags = rest.tags.map(tag => ({
          course_id: course.id,
          tag
        }));
        await CourseTag.bulkCreate(tags, { transaction });
      }
      
      // Update prerequisites
      if (rest.prerequisites) {
        await CoursePrerequisite.destroy({ where: { course_id: course.id }, transaction });
        const prerequisites = rest.prerequisites.map(prerequisite_id => ({
          course_id: course.id,
          prerequisite_course_id: prerequisite_id,
          min_completion_percentage: 100 // default
        }));
        await CoursePrerequisite.bulkCreate(prerequisites, { transaction });
      }
      
      await transaction.commit();
      
      // Log audit
      const changes = {
        old: oldData,
        new: updatedCourse.toJSON()
      };
      await AuditLogService.logAction(req.user.id, 'course:update', 'Course', course.id, changes, req.ip, req.headers['user-agent']);
      
      // Invalidate course caches
      await CacheManager.invalidateCourseCache(course.id);
      
      res.json({
        success: true,
        message: submittedForApproval ? 'Course submitted for approval' : 'Course updated successfully',
        data: {
          ...updatedCourse.toJSON(),
          submitted_for_approval: submittedForApproval
        }
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Delete a course (soft delete)
  static async deleteCourse(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this course'
        });
      }
      
      // Soft delete the course
      await course.destroy({ transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'course:delete', 'Course', course.id, { title: course.title }, req.ip, req.headers['user-agent']);
      
      // Invalidate course caches
      await CacheManager.invalidateCourseCache(course.id);
      
      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Get all sections for a course
  static async getCourseSections(req, res, next) {
    try {
      const { id } = req.params;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if course is published or user has permission
      if (course.status !== 'published' && (!req.user || (req.user.id !== course.instructor_id && req.user.role.name !== 'admin'))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      const sections = await Section.findAll({
        where: { course_id: course.id },
        include: [{
          model: Lesson,
          as: 'lessons'
        }],
        order: [['display_order', 'ASC']]
      });
      
      // Add lesson completion status if user is enrolled
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          where: { user_id: req.user.id, course_id: course.id }
        });
        
        if (enrollment) {
          const lessonCompletions = await LessonCompletion.findAll({
            where: { enrollment_id: enrollment.id }
          });
          
          const sectionsWithStatus = sections.map(section => {
            const lessonsWithStatus = section.lessons.map(lesson => {
              const completion = lessonCompletions.find(lc => lc.lesson_id === lesson.id);
              return {
                ...lesson.toJSON(),
                isCompleted: !!completion,
                completed_at: completion ? completion.completed_at : null
              };
            });
            
            return {
              ...section.toJSON(),
              lessons: lessonsWithStatus
            };
          });
          
          return res.json({
            success: true,
            data: sectionsWithStatus
          });
        }
      }
      
      res.json({
        success: true,
        data: sections
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create a new section
  static async createSection(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { title, description, display_order } = req.body;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to create sections for this course'
        });
      }
      
      const section = await Section.create({
        course_id: course.id,
        title,
        description,
        display_order
      }, { transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'section:create', 'Section', section.id, { title: section.title, course_id: course.id }, req.ip, req.headers['user-agent']);
      
      res.status(201).json({
        success: true,
        data: section
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Update a section
  static async updateSection(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id, sectionId } = req.params;
      const { title, description, display_order } = req.body;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      const section = await Section.findOne({ where: { id: sectionId, course_id: course.id } });
      
      if (!section) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this section'
        });
      }
      
      const oldData = { ...section.toJSON() };
      const updatedSection = await section.update({
        title,
        description,
        display_order
      }, { transaction });
      
      await transaction.commit();
      
      // Log audit
      const changes = {
        old: oldData,
        new: updatedSection.toJSON()
      };
      await AuditLogService.logAction(req.user.id, 'section:update', 'Section', section.id, changes, req.ip, req.headers['user-agent']);
      
      res.json({
        success: true,
        data: updatedSection
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Delete a section
  static async deleteSection(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id, sectionId } = req.params;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      const section = await Section.findOne({ where: { id: sectionId, course_id: course.id } });
      
      if (!section) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this section'
        });
      }
      
      // Delete section and associated lessons
      await Lesson.destroy({ where: { section_id: section.id }, transaction });
      await section.destroy({ transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'section:delete', 'Section', section.id, { title: section.title, course_id: course.id }, req.ip, req.headers['user-agent']);
      
      res.json({
        success: true,
        message: 'Section deleted successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Get lesson by ID
  static async getLessonById(req, res, next) {
    try {
      const { id } = req.params;
      
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
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      
      // Check if course is published or user has permission
      if (lesson.section.course.status !== 'published' && (!req.user || (req.user.id !== lesson.section.course.instructor_id && req.user.role.name !== 'admin'))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Add completion status if user is enrolled
      let isCompleted = false;
      let completed_at = null;
      
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          where: { user_id: req.user.id, course_id: lesson.section.course_id }
        });
        
        if (enrollment) {
          const completion = await LessonCompletion.findOne({
            where: { user_id: req.user.id, lesson_id: lesson.id, enrollment_id: enrollment.id }
          });
          
          if (completion) {
            isCompleted = true;
            completed_at = completion.completed_at;
          }
        }
      }
      
      const lessonData = {
        ...lesson.toJSON(),
        isCompleted,
        completed_at
      };
      
      res.json({
        success: true,
        data: lessonData
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create a new lesson
  static async createLesson(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id, sectionId } = req.params;
      const lessonData = req.body;
      
      const course = await Course.findOne({ where: { id } });
      
      if (!course) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      const section = await Section.findOne({ where: { id: sectionId, course_id: course.id } });
      
      if (!section) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== course.instructor_id && req.user.id !== course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to create lessons for this course'
        });
      }
      
      const lesson = await Lesson.create({
        section_id: section.id,
        ...lessonData
      }, { transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'lesson:create', 'Lesson', lesson.id, { title: lesson.title, section_id: section.id }, req.ip, req.headers['user-agent']);
      
      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Update a lesson
  static async updateLesson(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const lessonData = req.body;
      
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
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== lesson.section.course.instructor_id && req.user.id !== lesson.section.course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this lesson'
        });
      }
      
      const oldData = { ...lesson.toJSON() };
      const updatedLesson = await lesson.update(lessonData, { transaction });
      
      await transaction.commit();
      
      // Log audit
      const changes = {
        old: oldData,
        new: updatedLesson.toJSON()
      };
      await AuditLogService.logAction(req.user.id, 'lesson:update', 'Lesson', lesson.id, changes, req.ip, req.headers['user-agent']);
      
      res.json({
        success: true,
        data: updatedLesson
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Delete a lesson
  static async deleteLesson(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      
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
      
      // Check permissions
      if (req.user.role.name !== 'admin' && req.user.id !== lesson.section.course.instructor_id && req.user.id !== lesson.section.course.created_by) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this lesson'
        });
      }
      
      await lesson.destroy({ transaction });
      
      await transaction.commit();
      
      // Log audit
      await AuditLogService.logAction(req.user.id, 'lesson:delete', 'Lesson', lesson.id, { title: lesson.title, section_id: lesson.section_id }, req.ip, req.headers['user-agent']);
      
      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = CourseController;