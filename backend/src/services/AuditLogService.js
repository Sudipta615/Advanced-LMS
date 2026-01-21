const { AuditLog } = require('../models');

class AuditLogService {
  
  static async logAction(userId, action, resourceType, resourceId, changes, ipAddress, userAgent) {
    try {
      await AuditLog.create({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes: JSON.stringify(changes),
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }
  
  static async getAuditLogs(filter = {}) {
    try {
      const logs = await AuditLog.findAll({
        where: filter,
        order: [['created_at', 'DESC']],
        limit: 100
      });
      return logs;
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }
  
  static async getAuditLogsByUser(userId) {
    return this.getAuditLogs({ user_id: userId });
  }
  
  static async getAuditLogsByResource(resourceType, resourceId) {
    return this.getAuditLogs({ resource_type: resourceType, resource_id: resourceId });
  }
}

module.exports = AuditLogService;