const { Certificate, Enrollment, User, Course } = require('../models');
const CertificateService = require('../services/CertificateService');

class CertificateController {
  
  static async generateCertificate(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;

      const enrollment = await Enrollment.findOne({
        where: { id: enrollmentId, user_id: userId }
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Course must be completed to generate certificate'
        });
      }

      const certificate = await CertificateService.generateCertificate(enrollmentId);

      res.status(201).json({
        success: true,
        message: 'Certificate generated successfully',
        data: certificate
      });
    } catch (error) {
      if (error.message.includes('Minimum score')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  static async getCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id;

      const certificate = await Certificate.findOne({
        where: { id: certificateId, user_id: userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }
        ]
      });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      res.json({
        success: true,
        data: certificate
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCertificate(req, res, next) {
    try {
      const { verificationToken } = req.params;

      const result = await CertificateService.verifyCertificate(verificationToken);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCertificates(req, res, next) {
    try {
      const userId = req.user.id;

      const certificates = await Certificate.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'thumbnail_url']
          }
        ],
        order: [['issued_date', 'DESC']]
      });

      res.json({
        success: true,
        data: certificates
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CertificateController;
