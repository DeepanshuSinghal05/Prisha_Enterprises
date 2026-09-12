const express = require('express');
const { handleWebhook } = require('../controllers/paymentController');
const { verifyWebhookSignature } = require('../utils/razorpay');

const router = express.Router();

// POST /api/payments/webhook - Razorpay webhook endpoint
// CSRF-exempt because Razorpay is not a browser client; handleWebhook verifies its HMAC signature.
router.post('/webhook', handleWebhook);

module.exports = router;
