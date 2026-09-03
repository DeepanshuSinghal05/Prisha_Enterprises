const jwt = require('jsonwebtoken');

// Enforce JWT secrets - fail if not set (security requirement)
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('CRITICAL SECURITY ERROR: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
  console.error('Add these to your .env file before starting the server');
  process.exit(1);
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
