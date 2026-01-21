const { Course, Category, Section, Lesson, User, Enrollment, LessonCompletion, CoursePrerequisite, CourseTag } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const AuditLogService = require('../services/AuditLogService');

class CourseController {
  
  // Get all courses with pagination and filtering
  static async getAllCourses(req, res, next) {
    try {
      const { page = 1, limit = 10, search, category, difficulty, tags, status } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const where = { status: 'published' };
      
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }
      
      if (category) {
        const categoryRecord = await Category.findOne({ where: { slug: category } });
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
      
      // Handle tags filtering
      let courses;
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        courses = await Course.findAll({
          where,
          include: [
            { model: Category, as: 'category' },
            { model: User, as: 'instructor', attributes: ['id', 'first_name', 'last_name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        });
        
        // Filter by tags
        courses = courses.filter(course => {
          return tagArray.every(tag => course.tags.includes(tag));
        });
      } else {
        courses = await Course.findAll({
          where,
          include: [
            { model: Category, as: 'category' },
            { model: User, as: 'instructor', attributes: ['id', 'first_name', 'last_name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        });
      }
      
      // Get total count for pagination
      const total = await Course.count({ where });
      
      // Add enrollment status if user is authenticated
      if (req.user) {
        const userId = req.user.id;
        const enrollments = await Enrollment.findAll({
          where: { user_id: userId, course_id: courses.map(c => c.id) },
          attributes: ['course_id', 'status', 'completion_percentage']
        });
        
        courses = courses.map(course => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          return {
            ...course.toJSON(),
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment ? enrollment.status : null,
            completionPercentage: enrollment ? enrollment.completion_percentage : 0
          };
        });
      }
      
      res.json({
        success: true,
        data: courses,
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
  
  // Get course by ID
  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      
      const course = await Course.findOne({
        where: { id },
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'instructor', attributes: ['id', 'first_name', 'last_name', 'profile_picture_url'] },
          {
            model: Section,
            as: 'sections',
            include: [{
              model: Lesson,
              as: 'lessons'
            }]
          }
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
      
      // Add enrollment status if user is authenticated
      let enrollmentStatus = null;
      let completionPercentage = 0;
      let isEnrolled = false;
      
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          where: { user_id: req.user.id, course_id: course.id }
        });
        
        if (enrollment) {
          isEnrolled = true;
          enrollmentStatus = enrollment.status;
          completionPercentage = enrollment.completion_percentage;
        }
      }
      
      // Get prerequisites
      const prerequisites = await CoursePrerequisite.findAll({
        where: { course_id: course.id },
        include: [{
          model: Course,
          as: 'prerequisite_course',
          attributes: ['id', 'title', 'slug']
        }]
      });
      
      // Get tags
      const tags = await CourseTag.findAll({
        where: { course_id: course.id },
        attributes: ['tag']
      });
      
      const courseData = {
        ...course.toJSON(),
        isEnrolled,
        enrollmentStatus,
        completionPercentage,
        prerequisites: prerequisites.map(p => ({
          course_id: p.prerequisite_course_id,
          title: p.prerequisite_course.title,
          slug: p.prerequisite_course.slug,
          min_completion_percentage: p.min_completion_percentage
        })),
        tags: tags.map(t => t.tag)
      };
      
      res.json({
        success: true,
        data: courseData
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
      
      res.json({
        success: true,
        data: updatedCourse
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