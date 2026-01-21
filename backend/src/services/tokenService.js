const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { getRedisClient } = require('../config/redis');

class TokenService {
  async generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.role_id
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token) {
    return verifyToken(token);
  }

  async verifyRefreshToken(token) {
    return verifyToken(token);
  }

  async blacklistToken(token) {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('⚠️  Redis not available. Token blacklisting skipped.');
      return;
    }

    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          // Store token in blacklist with TTL equal to remaining expiry
          await redisClient.setEx(`blacklist:${token}`, ttl, 'true');
        }
      } else {
        // If we can't decode it but want to blacklist it anyway (e.g. on logout/rotation)
        // use a default TTL (e.g. 7 days for refresh tokens)
        await redisClient.setEx(`blacklist:${token}`, 7 * 24 * 60 * 60, 'true');
      }
    } catch (error) {
      // Even if verification fails, we should still blacklist the string if it's provided
      await redisClient.setEx(`blacklist:${token}`, 7 * 24 * 60 * 60, 'true');
    }
  }

  async isTokenBlacklisted(token) {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    try {
      const result = await redisClient.get(`blacklist:${token}`);
      return result !== null;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false;
    }
  }
}

module.exports = new TokenService();
