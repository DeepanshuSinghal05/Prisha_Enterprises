const express = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const { validate, orderValidators } = require('../middleware/validation');
const { getMyOrders, getOrderById } = require('../controllers/orderController');

const router = express.Router();

// GET /api/orders/my-orders - Get all orders for current user
router.get('/my-orders', authenticate, requireAuth, validate(orderValidators.list), getMyOrders);

// GET /api/orders/:id - Get single order details
router.get('/:id', authenticate, requireAuth, validate(orderValidators.getById), getOrderById);

module.exports = router;
