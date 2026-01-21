const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Role, Enrollment, Course, AuditLog, UserBan } = require('../models');
const { hashPassword } = require('../utils/passwordHash');
const AuditLogService = require('../services/AuditLogService');
const emailService = require('../services/emailService');
const { parsePagination } = require('../utils/pagination');

const generateTempPassword = () => {
  return crypto.randomBytes(10).toString('base64url');
};

const generateUsernameFromEmail = async (email) => {
  const base = (email.split('@')[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20) || 'user';

  let username = base;
  let counter = 0;
  while (true) {
    const exists = await User.findOne({ where: { username }, attributes: ['id'] });
    if (!exists) return username;

    counter += 1;
    username = `${base}_${counter}`.slice(0, 30);
  }
};

class AdminUserController {
  static async listUsers(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
      const { search, role, status, sort = 'created_at', order = 'DESC' } = req.query;

      const where = {};

      if (status === 'active') where.is_active = true;
      if (status === 'inactive') where.is_active = false;

      if (search) {
        where[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const roleInclude = {
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      };

      if (role) {
        roleInclude.where = { name: role };
      }

      const allowedSort = new Set(['created_at', 'last_login', 'email', 'first_name', 'last_name']);
      const safeSort = allowedSort.has(sort) ? sort : 'created_at';
      const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows } = await User.findAndCountAll({
        where,
        include: [roleInclude],
        attributes: { exclude: ['password_hash', 'email_verification_token'] },
        order: [[safeSort, safeOrder]],
        limit,
        offset
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetails(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        attributes: { exclude: ['password_hash', 'email_verification_token'] }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const [enrollments, auditLogs, activeBan] = await Promise.all([
        Enrollment.findAll({
          where: { user_id: userId },
          include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'status'] }],
          order: [['enrolled_at', 'DESC']],
          limit: 100
        }),
        AuditLog.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']],
          limit: 100
        }),
        UserBan.findOne({
          where: {
            user_id: userId,
            [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }]
          },
          order: [['created_at', 'DESC']]
        })
      ]);

      res.json({
        success: true,
        data: {
          user,
          enrollments,
          audit_logs: auditLogs,
          active_ban: activeBan
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const { email, first_name, last_name, role: roleName, password, send_welcome_email = true } = req.validatedBody;

      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const tempPassword = password || generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);
      const username = await generateUsernameFromEmail(email);

      const user = await User.create({
        email,
        username,
        password_hash: passwordHash,
        first_name,
        last_name,
        role_id: role.id,
        is_email_verified: true,
        is_active: true
      });

      await AuditLogService.logAction(req.user.id, 'admin:user:create', 'User', user.id, { email, role: roleName }, req.ip, req.headers['user-agent']);

      if (send_welcome_email) {
        await emailService.sendWelcomeEmail(email, tempPassword, first_name);
      }

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            role: role.name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { first_name, last_name, bio, profile_picture_url, role: roleName, is_active } = req.validatedBody;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const changes = { before: user.toJSON(), after: {} };

      if (roleName) {
        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
          return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        user.role_id = role.id;
      }

      if (typeof first_name === 'string') user.first_name = first_name;
      if (typeof last_name === 'string') user.last_name = last_name;
      if (typeof bio === 'string' || bio === null) user.bio = bio;
      if (typeof profile_picture_url === 'string' || profile_picture_url === null) user.profile_picture_url = profile_picture_url;
      if (typeof is_active === 'boolean') user.is_active = is_active;

      await user.save();
      changes.after = user.toJSON();

      await AuditLogService.logAction(req.user.id, 'admin:user:update', 'User', user.id, changes, req.ip, req.headers['user-agent']);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            bio: user.bio,
            profilePictureUrl: user.profile_picture_url,
            role_id: user.role_id,
            is_active: user.is_active
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.is_active = false;
      await user.save();

      await AuditLogService.logAction(req.user.id, 'admin:user:deactivate', 'User', user.id, { is_active: false }, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const tempPassword = generateTempPassword();
      user.password_hash = await hashPassword(tempPassword);
      await user.save();

      await AuditLogService.logAction(req.user.id, 'admin:user:password_reset', 'User', user.id, { by: req.user.id }, req.ip, req.headers['user-agent']);

      await emailService.sendAdminPasswordResetEmail(user.email, tempPassword, user.first_name);

      res.json({ success: true, message: 'Password reset successfully and email sent' });
    } catch (error) {
      next(error);
    }
  }

  static async banUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason, ban_type = 'temporary', expires_at } = req.validatedBody;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const ban = await UserBan.create({
        user_id: userId,
        banned_by: req.user.id,
        reason,
        ban_type,
        expires_at: ban_type === 'permanent' ? null : expires_at
      });

      await AuditLogService.logAction(req.user.id, 'admin:user:ban', 'User', userId, { reason, ban_type, expires_at }, req.ip, req.headers['user-agent']);

      res.status(201).json({ success: true, data: ban });
    } catch (error) {
      next(error);
    }
  }

  static async unbanUser(req, res, next) {
    try {
      const { userId } = req.params;

      const deleted = await UserBan.destroy({
        where: { user_id: userId }
      });

      await AuditLogService.logAction(req.user.id, 'admin:user:unban', 'User', userId, { deleted }, req.ip, req.headers['user-agent']);

      res.json({ success: true, message: 'User unbanned successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getUserActivity(req, res, next) {
    try {
      const { userId } = req.params;

      const [auditLogs, enrollments] = await Promise.all([
        AuditLog.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']],
          limit: 200
        }),
        Enrollment.findAll({
          where: { user_id: userId },
          include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
          order: [['enrolled_at', 'DESC']],
          limit: 200
        })
      ]);

      res.json({
        success: true,
        data: {
          audit_logs: auditLogs,
          enrollments
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminUserController;
