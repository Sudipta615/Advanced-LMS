const { Notification, Enrollment, User } = require('../models');

class NotificationService {
  static async createNotification(userId, type, title, message, resourceType = null, resourceId = null, actionUrl = null) {
    try {
      return await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        resource_type: resourceType,
        resource_id: resourceId,
        action_url: actionUrl
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async notifyEnrolledStudents(courseId, type, title, message, resourceType = null, resourceId = null) {
    try {
      const enrollments = await Enrollment.findAll({
        where: { course_id: courseId, status: 'active' },
        attributes: ['user_id']
      });

      const notifications = enrollments.map(e => ({
        user_id: e.user_id,
        type,
        title,
        message,
        resource_type: resourceType,
        resource_id: resourceId,
        action_url: `/courses/${courseId}`
      }));

      await Notification.bulkCreate(notifications);
      return notifications.length;
    } catch (error) {
      console.error('Error notifying enrolled students:', error);
      throw error;
    }
  }

  static async notifyAssignmentDue(assignmentId, assignmentTitle, courseId, dueDate) {
    try {
      const enrollments = await Enrollment.findAll({
        where: { course_id: courseId, status: 'active' },
        attributes: ['user_id']
      });

      const notifications = enrollments.map(e => ({
        user_id: e.user_id,
        type: 'assignment_due',
        title: 'Assignment Due Soon',
        message: `Assignment "${assignmentTitle}" is due on ${dueDate.toLocaleDateString()}`,
        resource_type: 'Assignment',
        resource_id: assignmentId,
        action_url: `/courses/${courseId}/assignments/${assignmentId}`
      }));

      await Notification.bulkCreate(notifications);
    } catch (error) {
      console.error('Error notifying assignment due:', error);
    }
  }

  static async notifyQuizGraded(userId, quizTitle, score, passed, quizAttemptId, courseId) {
    try {
      await this.createNotification(
        userId,
        'quiz_grade',
        'Quiz Graded',
        `Your quiz "${quizTitle}" has been graded. Score: ${score}%. ${passed ? 'Congratulations, you passed!' : 'You did not pass this time.'}`,
        'QuizAttempt',
        quizAttemptId,
        `/courses/${courseId}/quiz-attempts/${quizAttemptId}`
      );
    } catch (error) {
      console.error('Error notifying quiz graded:', error);
    }
  }

  static async notifyAssignmentGraded(userId, assignmentTitle, score, feedback, submissionId, courseId) {
    try {
      await this.createNotification(
        userId,
        'quiz_grade',
        'Assignment Graded',
        `Your assignment "${assignmentTitle}" has been graded. Score: ${score}. ${feedback ? 'Check your submission for instructor feedback.' : ''}`,
        'AssignmentSubmission',
        submissionId,
        `/courses/${courseId}/submissions/${submissionId}`
      );
    } catch (error) {
      console.error('Error notifying assignment graded:', error);
    }
  }
}

module.exports = NotificationService;
