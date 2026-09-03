const rateLimit = require('express-rate-limit');
const { logSuspiciousTraffic } = require('../utils/logger');

const handleRateLimitExceeded = (req, res, next, options) => {
  logSuspiciousTraffic(req, `Rate limit exceeded for path: ${req.path}`);
  res.status(options.statusCode).json(options.message);
};

// Auth routes rate limiter - 10 requests per 60 seconds
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: handleRateLimitExceeded,
  message: {
    success: false,
    message: 'Too many auth requests. Please try again after 60 seconds.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for account creation (signup) - 3 per hour
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  handler: handleRateLimitExceeded,
  message: {
    success: false,
    message: 'Too many accounts created from this IP. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter - 100 requests per 5 minutes
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  handler: handleRateLimitExceeded,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for login attempts - 5 per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: handleRateLimitExceeded,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for AI generation endpoints - 5 per day (Placeholder for AI routes)
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  handler: handleRateLimitExceeded,
  message: {
    success: false,
    message: 'Daily AI generation limit reached. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Basic Bot & Scraper protection middleware
const botBlocker = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  // List of known automated scraper/bot signatures
  const botSignatures = [
    'curl', 'python-requests', 'scrapy', 'postmanruntime',
    'wget', 'urllib', 'httpclient', 'java', 'ruby', 'axios'
  ];

  const isBot = botSignatures.some(sig => userAgent.toLowerCase().includes(sig));
  const isMissingUserAgent = !userAgent || userAgent.trim() === '';

  // Only block bots in production, and optionally whitelist certain endpoints like webhooks
  if (process.env.NODE_ENV === 'production' && req.path !== '/api/payments/webhook') {
    if (isMissingUserAgent || isBot) {
      logSuspiciousTraffic(req, `Blocked automated bot/scraper request. User-Agent: ${userAgent}`);
      return res.status(403).json({
        success: false,
        message: 'Automated requests are not allowed.'
      });
    }
  }

  next();
};

module.exports = {
  authLimiter,
  signupLimiter,
  apiLimiter,
  loginLimiter,
  aiLimiter,
  botBlocker
};
