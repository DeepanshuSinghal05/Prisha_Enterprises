const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');
const { User } = require('../models');
const { logAuth, logSuspiciousTraffic } = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    // Read token from httpOnly cookie instead of Authorization header
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      logAuth('TOKEN_USER_NOT_FOUND', { ip: req.ip, userId: decoded.id });
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    logSuspiciousTraffic(req, `Invalid token attempt: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

const authenticateOptional = async (req, res, next) => {
  try {
    // Read token from httpOnly cookie
    const token = req.cookies.accessToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please login to access this resource.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authenticateOptional,
  requireAuth
};
