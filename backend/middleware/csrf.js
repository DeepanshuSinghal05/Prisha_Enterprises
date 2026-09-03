const crypto = require('crypto');

/**
 * CSRF Protection Middleware using Double Submit Cookie Pattern
 *
 * 1. Server generates a cryptographically strong random token
 * 2. Server sets this token in a cookie (not httpOnly, so JS can read it)
 * 3. Client reads the cookie and includes it in a custom header (X-CSRF-Token)
 * 4. Server verifies the cookie value matches the header value for state-changing requests
 */

// Generate and set CSRF token
const setCsrfToken = (req, res, next) => {
  // Only generate a new token if one doesn't exist
  let csrfToken = req.cookies['XSRF-TOKEN'];

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Must be readable by client JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must match other auth cookies
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Also attach it to res.locals so templates can use it if needed
  res.locals.csrfToken = csrfToken;

  next();
};

// Validate CSRF token for state-changing requests
const validateCsrfToken = (req, res, next) => {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies['XSRF-TOKEN'];
  // Axios automatically sends the XSRF-TOKEN cookie back in this header
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Request blocked for security reasons.'
    });
  }

  next();
};

module.exports = {
  setCsrfToken,
  validateCsrfToken
};