const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validate, adminValidators } = require('../middleware/validation');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Rate limiter for admin login (5 attempts per 15 minutes)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Admin login - public route with rate limiting
router.post('/login', adminLoginLimiter, validate(adminValidators.login), adminController.login);

// Admin logout
router.post('/logout', authenticateAdmin, adminController.logout);

// Get current admin profile
router.get('/me', authenticateAdmin, adminController.getProfile);

// Get dashboard stats
router.get('/stats', authenticateAdmin, adminController.getStats);

// Get all orders with search, filter, pagination
router.get('/orders', authenticateAdmin, validate(adminValidators.getOrders), adminController.getOrders);

// Get order by ID
router.get('/orders/:id', authenticateAdmin, validate(adminValidators.getOrderById), adminController.getOrderById);

// Update order status
router.patch('/orders/:id/status', authenticateAdmin, validate(adminValidators.updateOrderStatus), adminController.updateOrderStatus);

module.exports = router;