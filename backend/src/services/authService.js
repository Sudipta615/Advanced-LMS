const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');
const { User, Role, PasswordResetToken, AuditLog } = require('../models');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const tokenService = require('./tokenService');
const emailService = require('./emailService');

class AuthService {
  async register(userData, ipAddress, userAgent) {
    const { email, username, password, firstName, lastName } = userData;

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const studentRole = await Role.findOne({ where: { name: 'student' } });
    if (!studentRole) {
      throw new Error('Default role not found. Please run database seed.');
    }

    const passwordHash = await hashPassword(password);
    const emailVerificationToken = uuidv4();

    const user = await User.create({
      email,
      username,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role_id: studentRole.id,
      email_verification_token: emailVerificationToken,
      is_email_verified: false
    });

    await AuditLog.create({
      user_id: user.id,
      action: 'user_registered',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    await emailService.sendVerificationEmail(email, emailVerificationToken, firstName);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name
    };
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      where: { email_verification_token: token }
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (user.is_email_verified) {
      throw new Error('Email already verified');
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_email_verified) {
      throw new Error('Please verify your email before logging in');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokens = await tokenService.generateTokens(user);

    const redisClient = getRedisClient();
    if (redisClient) {
      const decodedAccess = await tokenService.verifyAccessToken(tokens.accessToken);
      if (decodedAccess && decodedAccess.exp) {
        const ttl = decodedAccess.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.setEx(`session:${tokens.accessToken}`, ttl, user.id);
        }
      }
    }

    user.last_login = new Date();
    await user.save();

    await AuditLog.create({
      user_id: user.id,
      action: 'user_login',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role.name,
        permissions: user.role.permissions
      },
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is blacklisted (Detect reuse/breach)
    const isBlacklisted = await tokenService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      // Token reuse detected! Potential security breach.
      // In a real app, we should revoke all tokens for this user.
      throw new Error('Security breach detected: Refresh token reuse');
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Refresh token rotation: Blacklist old token, issue new ones
    await tokenService.blacklistToken(refreshToken);
    
    const tokens = await tokenService.generateTokens(user);
    return tokens;
  }

  async logout(token, userId, ipAddress, userAgent) {
    await tokenService.blacklistToken(token);

    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await redisClient.del(`session:${token}`);
      } catch (error) {
        console.warn('⚠️  Failed to delete session key:', error);
      }
    }

    await AuditLog.create({
      user_id: userId,
      action: 'user_logout',
      resource_type: 'user',
      resource_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.create({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt
    });

    await emailService.sendPasswordResetEmail(email, resetToken, user.first_name);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token, newPassword, ipAddress, userAgent) {
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{ model: User, as: 'user' }]
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetToken.used_at) {
      throw new Error('Reset token has already been used');
    }

    if (new Date() > resetToken.expires_at) {
      throw new Error('Reset token has expired');
    }

    const passwordHash = await hashPassword(newPassword);
    resetToken.user.password_hash = passwordHash;
    await resetToken.user.save();

    resetToken.used_at = new Date();
    await resetToken.save();

    await AuditLog.create({
      user_id: resetToken.user.id,
      action: 'password_reset',
      resource_type: 'user',
      resource_id: resetToken.user.id,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return { message: 'Password reset successfully' };
  }

  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'email_verification_token'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      bio: user.bio,
      role: user.role.name,
      permissions: user.role.permissions,
      isEmailVerified: user.is_email_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at
    };
  }
}

module.exports = new AuthService();
