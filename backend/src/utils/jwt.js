const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiry, refreshTokenExpiry } = require('../config/jwt');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: refreshTokenExpiry });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
