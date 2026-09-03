const express = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const { validate, cartValidators } = require('../middleware/validation');
const { createCheckoutOrder, verifyPayment, processMockPayment } = require('../controllers/cartController');

const router = express.Router();

// POST /api/cart/checkout/create-order - Create order and get Razorpay order ID
router.post('/checkout/create-order', authenticate, requireAuth, validate(cartValidators.checkout), createCheckoutOrder);

// POST /api/cart/checkout/verify-payment - Verify payment signature
router.post('/checkout/verify-payment', authenticate, requireAuth, validate(cartValidators.payment), verifyPayment);

// POST /api/cart/checkout/place-order - Place order with mock payment (no Razorpay needed)
router.post('/checkout/place-order', authenticate, requireAuth, validate(cartValidators.checkout), processMockPayment);

module.exports = router;
