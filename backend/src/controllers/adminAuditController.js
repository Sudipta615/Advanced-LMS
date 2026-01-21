const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');
const { parsePagination } = require('../utils/pagination');

class AdminAuditController {
  static async listAuditLogs(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 200 });
      const { user_id, action, resource_type, date_from, date_to } = req.query;

      const where = {};
      if (user_id) where.user_id = user_id;
      if (action) where.action = { [Op.iLike]: `%${action}%` };
      if (resource_type) where.resource_type = resource_type;

      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at[Op.gte] = new Date(date_from);
        if (date_to) where.created_at[Op.lte] = new Date(date_to);
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }],
        order: [['created_at', 'DESC']],
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

  static async activityReport(req, res, next) {
    try {
      const { date_from, date_to } = req.query;

      const where = {};
      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at[Op.gte] = new Date(date_from);
        if (date_to) where.created_at[Op.lte] = new Date(date_to);
      }

      const totalActions = await AuditLog.count({ where });

      const mostActiveUsers = await AuditLog.findAll({
        where,
        attributes: ['user_id', [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']],
        group: ['user_id'],
        order: [[AuditLog.sequelize.literal('count'), 'DESC']],
        limit: 10,
        raw: true
      });

      res.json({
        success: true,
        data: {
          total_actions: totalActions,
          most_active_users: mostActiveUsers
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminAuditController;
