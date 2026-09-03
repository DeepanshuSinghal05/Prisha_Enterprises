const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getLogStream = (filename) => {
  return fs.createWriteStream(path.join(logDir, filename), { flags: 'a' });
};

const authStream = getLogStream('auth.log');
const errorStream = getLogStream('error.log');
const trafficStream = getLogStream('traffic.log');

const formatLog = (level, event, data) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data
  }) + '\n';
};

const logAuth = (event, data) => {
  const logStr = formatLog('INFO', event, data);
  authStream.write(logStr);
  if (process.env.NODE_ENV === 'development') console.log('[AUTH]', logStr.trim());
};

const logError = (error, req = null) => {
  const data = {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    name: error.name
  };
  if (req) {
    data.path = req.path;
    data.method = req.method;
    data.ip = req.ip;
  }
  const logStr = formatLog('ERROR', 'API_ERROR', data);
  errorStream.write(logStr);
  console.error('[ERROR]', logStr.trim());
};

const logSuspiciousTraffic = (req, reason) => {
  const data = {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    reason
  };
  const logStr = formatLog('WARN', 'SUSPICIOUS_TRAFFIC', data);
  trafficStream.write(logStr);
  console.warn('[TRAFFIC]', logStr.trim());
};

module.exports = {
  logAuth,
  logError,
  logSuspiciousTraffic
};