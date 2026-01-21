const { CertificateTemplate } = require('../models');
const AuditLogService = require('../services/AuditLogService');

class CertificateTemplateController {
  static async createTemplate(req, res, next) {
    try {
      const userId = req.user.id;
      const template = await CertificateTemplate.create({
        ...req.body,
        created_by: userId
      });

      await AuditLogService.log('certificate_template_created', userId, 'CertificateTemplate', template.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Certificate template created successfully',
        data: template
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const userId = req.user.id;

      const template = await CertificateTemplate.findByPk(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Certificate template not found'
        });
      }

      await template.update(req.body);
      await AuditLogService.log('certificate_template_updated', userId, 'CertificateTemplate', templateId, req.body);

      res.json({
        success: true,
        message: 'Certificate template updated successfully',
        data: template
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const userId = req.user.id;

      const template = await CertificateTemplate.findByPk(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Certificate template not found'
        });
      }

      await template.destroy();
      await AuditLogService.log('certificate_template_deleted', userId, 'CertificateTemplate', templateId);

      res.json({
        success: true,
        message: 'Certificate template deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async listTemplates(req, res, next) {
    try {
      const templates = await CertificateTemplate.findAll({
        order: [['is_default', 'DESC'], ['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CertificateTemplateController;
