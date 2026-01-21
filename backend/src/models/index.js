const Role = require('./Role');
const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const AuditLog = require('./AuditLog');
const Category = require('./Category');
const Course = require('./Course');
const Section = require('./Section');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');
const LessonCompletion = require('./LessonCompletion');
const CoursePrerequisite = require('./CoursePrerequisite');
const CourseTag = require('./CourseTag');

const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizAnswerOption = require('./QuizAnswerOption');
const QuizAttempt = require('./QuizAttempt');
const QuizResponse = require('./QuizResponse');
const Assignment = require('./Assignment');
const AssignmentSubmission = require('./AssignmentSubmission');
const Certificate = require('./Certificate');
const CertificateTemplate = require('./CertificateTemplate');
const Notification = require('./Notification');
const Announcement = require('./Announcement');
const CourseDiscussion = require('./CourseDiscussion');
const DiscussionComment = require('./DiscussionComment');

module.exports = {
  Role,
  User,
  PasswordResetToken,
  AuditLog,
  Category,
  Course,
  Section,
  Lesson,
  Enrollment,
  LessonCompletion,
  CoursePrerequisite,
  CourseTag,

  Quiz,
  QuizQuestion,
  QuizAnswerOption,
  QuizAttempt,
  QuizResponse,
  Assignment,
  AssignmentSubmission,
  Certificate,
  CertificateTemplate,
  Notification,
  Announcement,
  CourseDiscussion,
  DiscussionComment
};
