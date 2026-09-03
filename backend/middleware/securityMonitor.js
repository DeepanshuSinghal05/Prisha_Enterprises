const { logSuspiciousTraffic } = require('../utils/logger');

// Simple in-memory tracker for suspicious behavior
const ipTracker = new Map();
// Blocklist
const blockList = new Set();

const IP_BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
const SUSPICIOUS_THRESHOLD = 50; // 50 failed requests (401, 403, 404) in the time window
const TRACKING_WINDOW = 5 * 60 * 1000; // 5 minutes

const blocklistMiddleware = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress;

  if (blockList.has(ip)) {
    return res.status(403).json({
      success: false,
      message: 'Your IP has been temporarily blocked due to suspicious activity. Please try again later.'
    });
  }
  next();
};

const securityMonitor = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress;

  // Track response finishing
  res.on('finish', () => {
    const statusCode = res.statusCode;

    // Check if the response is an error that typically indicates enumeration or attacks
    if (statusCode === 401 || statusCode === 403 || statusCode === 404 || statusCode === 429) {
      const now = Date.now();
      let record = ipTracker.get(ip);

      if (!record) {
        record = { count: 0, firstSeen: now };
      }

      // Reset window if it has passed
      if (now - record.firstSeen > TRACKING_WINDOW) {
        record.count = 1;
        record.firstSeen = now;
      } else {
        record.count += 1;
      }

      ipTracker.set(ip, record);

      if (record.count >= SUSPICIOUS_THRESHOLD && !blockList.has(ip)) {
        logSuspiciousTraffic(req, `IP blocked for too many failed requests (${record.count} in ${TRACKING_WINDOW/1000}s). Status code: ${statusCode}`);
        blockList.add(ip);

        // Remove from blocklist after duration
        setTimeout(() => {
          blockList.delete(ip);
          ipTracker.delete(ip);
        }, IP_BLOCK_DURATION);
      }
    }
  });

  next();
};

module.exports = {
  blocklistMiddleware,
  securityMonitor
};
