const { logError } = require('../utils/logger');
const { verifyAccessToken } = require('../utils/jwt');
const { User, AdminActionLog } = require('../models');

/**
 * Middleware to authenticate admin users using JWT
 * Extracts token from httpOnly cookie exclusively (for security against XSS)
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Only check httpOnly cookie for XSS protection
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Verify token using shared utility
    const decoded = verifyAccessToken(token);

    // Check if user exists and is admin
    const user = await User.findByPk(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access denied'
      });
    }

    req.admin = user;
    req.adminId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin session expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
    logError(error, req);
    return res.status(500).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};

/**
 * Log admin action for audit trail
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} actionType - Type of action (e.g., 'ORDER_STATUS_UPDATE', 'ADMIN_LOGIN')
 * @param {string} targetType - Type of target (e.g., 'order', 'admin', 'product')
 * @param {string|number} targetId - ID of the target entity
 * @param {object|null} oldValue - Previous state (will be JSON stringified)
 * @param {object|null} newValue - New state (will be JSON stringified)
 * @param {string|null} ipAddress - Client IP address for audit trail
 * @param {object} [req] - Optional Express request object for error logging context
 */
const logAdminAction = async (adminId, actionType, targetType, targetId, oldValue = null, newValue = null, ipAddress = null, req = null) => {
  try {
    await AdminActionLog.create({
      admin_user_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: ipAddress
    });
  } catch (error) {
    // Log the error with whatever context we have - use req if available for better debugging
    const errorContext = req || { path: 'unknown', method: 'unknown', ip: ipAddress };
    logError(error, errorContext);
    // Don't throw - logging failure shouldn't break the main operation
  }
};

module.exports = {
  authenticateAdmin,
  logAdminAction
};