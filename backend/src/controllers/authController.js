const authService = require('../services/authService');
const { 
  generateCsrfToken, 
  setCsrfCookie, 
  storeCsrfTokenInRedis 
} = require('../middleware/csrfProtection');

class AuthController {
  async register(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const user = await authService.register(
        req.validatedBody,
        ipAddress,
        userAgent
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.validatedBody;
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(
        email,
        password,
        ipAddress,
        userAgent
      );

      // Generate CSRF token for the session
      const csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken);
      
      if (result.user && result.user.id) {
        await storeCsrfTokenInRedis(result.user.id, csrfToken);
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          ...result,
          csrfToken // Include in response so frontend can store it
        }
      });
    } catch (error) {
      next(error);
    }
  }


  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.logout(
        req.token,
        req.user.id,
        ipAddress,
        userAgent
      );

      // Clear CSRF cookie
      res.clearCookie('__csrf');

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.validatedBody;
      const result = await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.validatedBody;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.resetPassword(
        token,
        password,
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
