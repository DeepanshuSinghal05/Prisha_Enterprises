require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const { logError } = require('./utils/logger');
const { apiLimiter, botBlocker } = require('./middleware/rateLimiter');
const { blocklistMiddleware, securityMonitor } = require('./middleware/securityMonitor');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const addressRoutes = require('./routes/addressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
});

// Security middleware
app.use(blocklistMiddleware);
app.use(securityMonitor);
app.use(botBlocker);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://*"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(hpp());

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Apply rate limiter globally to API routes
app.use('/api/', apiLimiter);

// CSRF Protection
const { setCsrfToken, validateCsrfToken } = require('./middleware/csrf');
app.use(setCsrfToken);

// Exclude razorpay webhook from CSRF check because it's a server-to-server call
const csrfExcludeUrls = ['/api/payments/webhook'];
app.use((req, res, next) => {
  if (csrfExcludeUrls.includes(req.path)) {
    return next();
  }
  validateCsrfToken(req, res, next);
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production access logging
  app.use(morgan('combined'));
}

// Health check endpoint for UptimeRobot
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log all errors structurally
  logError(err, req);

  // Validation error from express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  // Duplicate key error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Record already exists',
      field: err.fields ? err.fields[0] : undefined
    });
  }

  // Token expired
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.'
    });
  }

  // Unauthorized
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized'
    });
  }

  // Forbidden
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Forbidden'
    });
  }

  // Not found
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;