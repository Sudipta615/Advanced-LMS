const jwt = require('jsonwebtoken');
const { jwtSecret, jwtRefreshSecret, jwtExpiry, refreshTokenExpiry } = require('../config/jwt');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: refreshTokenExpiry });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtRefreshSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
