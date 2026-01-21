const crypto = require('crypto');
const { getRedisClient } = require('../config/redis');

/**
 * Generate a unique CSRF token
 * @returns {string} CSRF token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Set CSRF token in an HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} token - CSRF token
 */
const setCsrfCookie = (res, token) => {
  res.cookie('__csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
};

/**
 * Store CSRF token hash in Redis
 * @param {string} userId - User ID
 * @param {string} token - CSRF token
 */
const storeCsrfTokenInRedis = async (userId, token) => {
  const redisClient = getRedisClient();
  if (redisClient) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await redisClient.set(`csrf:${userId}`, tokenHash, {
      EX: 3600 // 1 hour
    });
  }
};

/**
 * Middleware to validate CSRF token
 */
const csrfProtection = async (req, res, next) => {
  // 1. Exclude safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 2. Exclude public auth endpoints that don't have a token yet
  const publicPaths = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/forgot-password', 
    '/api/auth/reset-password', 
    '/api/auth/verify-email'
  ];
  
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // 3. Get token from header and cookie
  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies ? req.cookies['__csrf'] : null;

  // 4. Basic validation
  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch or missing'
    });
  }

  // 5. Redis validation for authenticated users (defense in depth)
  if (req.user && req.user.id) {
    const redisClient = getRedisClient();
    if (redisClient) {
      const storedTokenHash = await redisClient.get(`csrf:${req.user.id}`);
      const incomingTokenHash = crypto.createHash('sha256').update(tokenFromHeader).digest('hex');
      
      if (storedTokenHash !== incomingTokenHash) {
        return res.status(403).json({
          success: false,
          message: 'CSRF token expired or invalid'
        });
      }
    }
  }

  next();
};

module.exports = {
  generateCsrfToken,
  setCsrfCookie,
  storeCsrfTokenInRedis,
  csrfProtection
};
