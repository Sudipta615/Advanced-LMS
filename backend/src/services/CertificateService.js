const { Certificate, CertificateTemplate, Enrollment, User, Course } = require('../models');
const crypto = require('crypto');

class CertificateService {
  static generateCertificateNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async generateCertificate(enrollmentId) {
    try {
      const enrollment = await Enrollment.findOne({
        where: { id: enrollmentId, status: 'completed' },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'required_score']
          }
        ]
      });

      if (!enrollment) {
        throw new Error('Enrollment not found or not completed');
      }

      if (enrollment.course.required_score && enrollment.completion_percentage < enrollment.course.required_score) {
        throw new Error(`Minimum score of ${enrollment.course.required_score}% required for certificate`);
      }

      const existingCertificate = await Certificate.findOne({
        where: { enrollment_id: enrollmentId }
      });

      if (existingCertificate) {
        return existingCertificate;
      }

      const certificate = await Certificate.create({
        enrollment_id: enrollmentId,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        certificate_number: this.generateCertificateNumber(),
        issued_date: new Date(),
        verification_token: this.generateVerificationToken(),
        certificate_url: null
      });

      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  static async verifyCertificate(verificationToken) {
    try {
      const certificate = await Certificate.findOne({
        where: { verification_token: verificationToken },
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
        return null;
      }

      if (certificate.expires_at && new Date() > certificate.expires_at) {
        return { ...certificate.toJSON(), expired: true };
      }

      return { ...certificate.toJSON(), expired: false };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }
}

module.exports = CertificateService;
