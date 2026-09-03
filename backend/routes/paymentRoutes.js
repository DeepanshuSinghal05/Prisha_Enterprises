const express = require('express');
const { handleWebhook } = require('../controllers/paymentController');
const { verifyWebhookSignature } = require('../utils/razorpay');

const router = express.Router();

// POST /api/payments/webhook - Razorpay webhook endpoint
// Signature verification is done inside handleWebhook
router.post('/webhook', handleWebhook);

module.exports = router;
