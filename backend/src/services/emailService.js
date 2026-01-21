const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const {
  getEmailVerificationTemplate,
  getPasswordResetTemplate,
  getWelcomeTemplate,
  getAdminPasswordResetTemplate
} = require('../utils/emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️  Email credentials not configured. Email functionality will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth
    });
  }

  async sendVerificationEmail(email, token, firstName) {
    if (!this.transporter) {
      console.log('📧 Email would be sent to:', email, 'with token:', token);
      return { success: true, message: 'Email service not configured (dev mode)' };
    }

    try {
      const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
      const template = getEmailVerificationTemplate(verificationLink, firstName);

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('✅ Verification email sent to:', email);
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email, token, firstName) {
    if (!this.transporter) {
      console.log('📧 Password reset email would be sent to:', email, 'with token:', token);
      return { success: true, message: 'Email service not configured (dev mode)' };
    }

    try {
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      const template = getPasswordResetTemplate(resetLink, firstName);

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('✅ Password reset email sent to:', email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email, tempPassword, firstName) {
    if (!this.transporter) {
      console.log('📧 Welcome email would be sent to:', email, 'with temp password:', tempPassword);
      return { success: true, message: 'Email service not configured (dev mode)' };
    }

    try {
      const template = getWelcomeTemplate(tempPassword, firstName);

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('✅ Welcome email sent to:', email);
      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendAdminPasswordResetEmail(email, tempPassword, firstName) {
    if (!this.transporter) {
      console.log('📧 Admin password reset email would be sent to:', email, 'with temp password:', tempPassword);
      return { success: true, message: 'Email service not configured (dev mode)' };
    }

    try {
      const template = getAdminPasswordResetTemplate(tempPassword, firstName);

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('✅ Admin password reset email sent to:', email);
      return { success: true, message: 'Admin password reset email sent' };
    } catch (error) {
      console.error('❌ Error sending admin password reset email:', error);
      throw new Error('Failed to send admin password reset email');
    }
  }
}

module.exports = new EmailService();
