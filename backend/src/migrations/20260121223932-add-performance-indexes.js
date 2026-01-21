/**
 * Migration: Add Performance Indexes
 * 
 * This migration adds database indexes to optimize query performance
 * and eliminate N+1 query problems across the application.
 * 
 * Indexes created:
 * - enrollments: user_id, course_id, status, composite (user_id, course_id)
 * - lesson_completions: user_id, enrollment_id, lesson_id
 * - courses: status, instructor_id
 * - sections: course_id
 * - lessons: section_id
 * - quizzes: lesson_id
 * - quiz_attempts: user_id, quiz_id, status
 * - points_history: user_id, created_at
 * - user_badges: user_id, earned_at
 * - leaderboards: course_id, ranking_period, user_id, composite indexes
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enrollments table indexes
    await queryInterface.addIndex('enrollments', ['user_id'], {
      name: 'idx_enrollments_user_id'
    });
    
    await queryInterface.addIndex('enrollments', ['course_id'], {
      name: 'idx_enrollments_course_id'
    });
    
    await queryInterface.addIndex('enrollments', ['status'], {
      name: 'idx_enrollments_status'
    });
    
    await queryInterface.addIndex('enrollments', ['user_id', 'course_id'], {
      name: 'idx_enrollments_user_course',
      unique: false
    });

    // Lesson completions table indexes
    await queryInterface.addIndex('lesson_completions', ['user_id'], {
      name: 'idx_lesson_completions_user_id'
    });
    
    await queryInterface.addIndex('lesson_completions', ['enrollment_id'], {
      name: 'idx_lesson_completions_enrollment_id'
    });
    
    await queryInterface.addIndex('lesson_completions', ['lesson_id'], {
      name: 'idx_lesson_completions_lesson_id'
    });

    // Courses table indexes
    await queryInterface.addIndex('courses', ['status'], {
      name: 'idx_courses_status'
    });
    
    await queryInterface.addIndex('courses', ['instructor_id'], {
      name: 'idx_courses_instructor_id'
    });
    
    await queryInterface.addIndex('courses', ['category_id'], {
      name: 'idx_courses_category_id'
    });

    // Sections table indexes
    await queryInterface.addIndex('sections', ['course_id'], {
      name: 'idx_sections_course_id'
    });

    // Lessons table indexes
    await queryInterface.addIndex('lessons', ['section_id'], {
      name: 'idx_lessons_section_id'
    });

    // Quizzes table indexes
    await queryInterface.addIndex('quizzes', ['lesson_id'], {
      name: 'idx_quizzes_lesson_id'
    });

    // Quiz attempts table indexes
    await queryInterface.addIndex('quiz_attempts', ['user_id'], {
      name: 'idx_quiz_attempts_user_id'
    });
    
    await queryInterface.addIndex('quiz_attempts', ['quiz_id'], {
      name: 'idx_quiz_attempts_quiz_id'
    });
    
    await queryInterface.addIndex('quiz_attempts', ['status'], {
      name: 'idx_quiz_attempts_status'
    });
    
    await queryInterface.addIndex('quiz_attempts', ['user_id', 'quiz_id'], {
      name: 'idx_quiz_attempts_user_quiz'
    });

    // Quiz questions table indexes
    await queryInterface.addIndex('quiz_questions', ['quiz_id'], {
      name: 'idx_quiz_questions_quiz_id'
    });

    // Quiz answer options table indexes
    await queryInterface.addIndex('quiz_answer_options', ['question_id'], {
      name: 'idx_quiz_answer_options_question_id'
    });

    // Assignments table indexes
    await queryInterface.addIndex('assignments', ['lesson_id'], {
      name: 'idx_assignments_lesson_id'
    });

    // Assignment submissions table indexes
    await queryInterface.addIndex('assignment_submissions', ['user_id'], {
      name: 'idx_assignment_submissions_user_id'
    });
    
    await queryInterface.addIndex('assignment_submissions', ['assignment_id'], {
      name: 'idx_assignment_submissions_assignment_id'
    });
    
    await queryInterface.addIndex('assignment_submissions', ['status'], {
      name: 'idx_assignment_submissions_status'
    });

    // Points history table indexes (for gamification)
    await queryInterface.addIndex('points_history', ['user_id'], {
      name: 'idx_points_history_user_id'
    });
    
    await queryInterface.addIndex('points_history', ['created_at'], {
      name: 'idx_points_history_created_at'
    });
    
    await queryInterface.addIndex('points_history', ['user_id', 'created_at'], {
      name: 'idx_points_history_user_created'
    });

    // User badges table indexes
    await queryInterface.addIndex('user_badges', ['user_id'], {
      name: 'idx_user_badges_user_id'
    });
    
    await queryInterface.addIndex('user_badges', ['badge_id'], {
      name: 'idx_user_badges_badge_id'
    });
    
    await queryInterface.addIndex('user_badges', ['earned_at'], {
      name: 'idx_user_badges_earned_at'
    });

    // User points table indexes
    await queryInterface.addIndex('user_points', ['user_id'], {
      name: 'idx_user_points_user_id',
      unique: true
    });

    // Leaderboards table indexes
    await queryInterface.addIndex('leaderboards', ['user_id'], {
      name: 'idx_leaderboards_user_id'
    });
    
    await queryInterface.addIndex('leaderboards', ['course_id'], {
      name: 'idx_leaderboards_course_id'
    });
    
    await queryInterface.addIndex('leaderboards', ['ranking_period'], {
      name: 'idx_leaderboards_ranking_period'
    });
    
    await queryInterface.addIndex('leaderboards', ['course_id', 'ranking_period'], {
      name: 'idx_leaderboards_course_period'
    });
    
    await queryInterface.addIndex('leaderboards', ['user_id', 'course_id', 'ranking_period'], {
      name: 'idx_leaderboards_unique_entry',
      unique: false
    });

    // Certificates table indexes
    await queryInterface.addIndex('certificates', ['user_id'], {
      name: 'idx_certificates_user_id'
    });
    
    await queryInterface.addIndex('certificates', ['course_id'], {
      name: 'idx_certificates_course_id'
    });

    // Course prerequisites table indexes
    await queryInterface.addIndex('course_prerequisites', ['course_id'], {
      name: 'idx_course_prerequisites_course_id'
    });
    
    await queryInterface.addIndex('course_prerequisites', ['prerequisite_course_id'], {
      name: 'idx_course_prerequisites_prereq_id'
    });

    // Course tags table indexes
    await queryInterface.addIndex('course_tags', ['course_id'], {
      name: 'idx_course_tags_course_id'
    });
    
    await queryInterface.addIndex('course_tags', ['tag'], {
      name: 'idx_course_tags_tag'
    });

    // Notifications table indexes
    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'idx_notifications_user_id'
    });
    
    await queryInterface.addIndex('notifications', ['is_read'], {
      name: 'idx_notifications_is_read'
    });

    // Learning streaks table indexes
    await queryInterface.addIndex('learning_streaks', ['user_id'], {
      name: 'idx_learning_streaks_user_id',
      unique: true
    });

    console.log('✅ Performance indexes created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop all indexes in reverse order
    await queryInterface.removeIndex('learning_streaks', 'idx_learning_streaks_user_id');
    await queryInterface.removeIndex('notifications', 'idx_notifications_is_read');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_id');
    await queryInterface.removeIndex('course_tags', 'idx_course_tags_tag');
    await queryInterface.removeIndex('course_tags', 'idx_course_tags_course_id');
    await queryInterface.removeIndex('course_prerequisites', 'idx_course_prerequisites_prereq_id');
    await queryInterface.removeIndex('course_prerequisites', 'idx_course_prerequisites_course_id');
    await queryInterface.removeIndex('certificates', 'idx_certificates_course_id');
    await queryInterface.removeIndex('certificates', 'idx_certificates_user_id');
    await queryInterface.removeIndex('leaderboards', 'idx_leaderboards_unique_entry');
    await queryInterface.removeIndex('leaderboards', 'idx_leaderboards_course_period');
    await queryInterface.removeIndex('leaderboards', 'idx_leaderboards_ranking_period');
    await queryInterface.removeIndex('leaderboards', 'idx_leaderboards_course_id');
    await queryInterface.removeIndex('leaderboards', 'idx_leaderboards_user_id');
    await queryInterface.removeIndex('user_points', 'idx_user_points_user_id');
    await queryInterface.removeIndex('user_badges', 'idx_user_badges_earned_at');
    await queryInterface.removeIndex('user_badges', 'idx_user_badges_badge_id');
    await queryInterface.removeIndex('user_badges', 'idx_user_badges_user_id');
    await queryInterface.removeIndex('points_history', 'idx_points_history_user_created');
    await queryInterface.removeIndex('points_history', 'idx_points_history_created_at');
    await queryInterface.removeIndex('points_history', 'idx_points_history_user_id');
    await queryInterface.removeIndex('assignment_submissions', 'idx_assignment_submissions_status');
    await queryInterface.removeIndex('assignment_submissions', 'idx_assignment_submissions_assignment_id');
    await queryInterface.removeIndex('assignment_submissions', 'idx_assignment_submissions_user_id');
    await queryInterface.removeIndex('assignments', 'idx_assignments_lesson_id');
    await queryInterface.removeIndex('quiz_answer_options', 'idx_quiz_answer_options_question_id');
    await queryInterface.removeIndex('quiz_questions', 'idx_quiz_questions_quiz_id');
    await queryInterface.removeIndex('quiz_attempts', 'idx_quiz_attempts_user_quiz');
    await queryInterface.removeIndex('quiz_attempts', 'idx_quiz_attempts_status');
    await queryInterface.removeIndex('quiz_attempts', 'idx_quiz_attempts_quiz_id');
    await queryInterface.removeIndex('quiz_attempts', 'idx_quiz_attempts_user_id');
    await queryInterface.removeIndex('quizzes', 'idx_quizzes_lesson_id');
    await queryInterface.removeIndex('lessons', 'idx_lessons_section_id');
    await queryInterface.removeIndex('sections', 'idx_sections_course_id');
    await queryInterface.removeIndex('courses', 'idx_courses_category_id');
    await queryInterface.removeIndex('courses', 'idx_courses_instructor_id');
    await queryInterface.removeIndex('courses', 'idx_courses_status');
    await queryInterface.removeIndex('lesson_completions', 'idx_lesson_completions_lesson_id');
    await queryInterface.removeIndex('lesson_completions', 'idx_lesson_completions_enrollment_id');
    await queryInterface.removeIndex('lesson_completions', 'idx_lesson_completions_user_id');
    await queryInterface.removeIndex('enrollments', 'idx_enrollments_user_course');
    await queryInterface.removeIndex('enrollments', 'idx_enrollments_status');
    await queryInterface.removeIndex('enrollments', 'idx_enrollments_course_id');
    await queryInterface.removeIndex('enrollments', 'idx_enrollments_user_id');

    console.log('✅ Performance indexes removed successfully');
  }
};
