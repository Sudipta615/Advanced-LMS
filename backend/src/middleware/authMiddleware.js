const { Op } = require('sequelize');
const tokenService = require('../services/tokenService');
const { User, Role, UserBan } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const isBlacklisted = await tokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    const decoded = await tokenService.verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const activeBan = await UserBan.findOne({
      where: {
        user_id: user.id,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      },
      order: [['created_at', 'DESC']]
    });

    if (activeBan) {
      return res.status(403).json({
        success: false,
        message: 'User is banned',
        data: {
          ban: {
            id: activeBan.id,
            reason: activeBan.reason,
            ban_type: activeBan.ban_type,
            expires_at: activeBan.expires_at
          }
        }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      role: {
        id: user.role.id,
        name: user.role.name
      },
      roleName: user.role.name,
      permissions: user.role.permissions
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { authenticateToken };
