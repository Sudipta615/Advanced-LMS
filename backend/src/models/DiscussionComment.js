const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const CourseDiscussion = require('./CourseDiscussion');
const User = require('./User');

const DiscussionComment = sequelize.define('DiscussionComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  discussion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'course_discussions',
      key: 'id'
    }
  },
  parent_comment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'discussion_comments',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_marked_as_answer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'discussion_comments',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['discussion_id'] },
    { fields: ['parent_comment_id'] },
    { fields: ['user_id'] }
  ]
});

DiscussionComment.belongsTo(CourseDiscussion, { foreignKey: 'discussion_id', as: 'discussion' });
DiscussionComment.belongsTo(DiscussionComment, { foreignKey: 'parent_comment_id', as: 'parentComment' });
DiscussionComment.hasMany(DiscussionComment, { foreignKey: 'parent_comment_id', as: 'replies' });
DiscussionComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = DiscussionComment;
