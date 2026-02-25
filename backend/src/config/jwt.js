require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d'
};
