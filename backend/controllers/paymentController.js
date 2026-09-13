const { Payment, Order, PendingCheckout, sequelize } = require('../models');
const { logError, logSuspiciousTraffic } = require('../utils/logger');
const { verifyWebhookSignature } = require('../utils/razorpay');
const { processSuccessfulPayment } = require('../utils/paymentUtils');

const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logError(new Error('Webhook secret not configured'), req);
      return res.status(500).json({
        success: false,
        message: 'Webhook configuration error'
      });
    }

    const sigHeader = req.headers['x-razorpay-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, sigHeader);

    if (!isValid) {
      logSuspiciousTraffic(req, 'Invalid webhook signature attempt');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = payload.event;
    const data = payload.payload;

    console.log(`Received webhook event: ${event}`);

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(data);
        break;
      case 'payment.captured':
        await handlePaymentCaptured(data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
      case 'order.paid':
        await handleOrderPaid(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    // Always return 200 to Razorpay (idempotency ensures no duplicate processing)
    res.status(200).json({ success: true });
  } catch (error) {
    logError(error, req);
    // Return 200 even on error to prevent Razorpay from retrying
    // The payment has likely already been processed or will be handled by verifyPayment
    res.status(200).json({ success: true });
  }
};

const handlePaymentAuthorized = async (data) => {
  const payment = data.payload.payment.entity;
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) {
    console.warn('Webhook authorized: missing order_id');
    return;
  }

  console.log(`Payment authorized for Razorpay order: ${razorpayOrderId}`);

  // Process through the standard flow
  try {
    await processSuccessfulPayment({
      gatewayOrderId: razorpayOrderId,
      gatewayPaymentId: payment.id,
      razorpayCapturedAmount: payment.amount / 100,
      method: payment.card ? 'card' : payment.vpa ? 'upi' : 'netbanking',
      rawResponse: payment,
      userId: null // Will be read from PendingCheckout
    });
  } catch (err) {
    console.error(`Error processing payment.authorized: ${err.message}`);
  }
};

const handlePaymentCaptured = async (data) => {
  const payment = data.payload.payment.entity;
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) {
    console.warn('Webhook captured: missing order_id');
    return;
  }

  console.log(`Payment captured for Razorpay order: ${razorpayOrderId}`);

  try {
    await processSuccessfulPayment({
      gatewayOrderId: razorpayOrderId,
      gatewayPaymentId: payment.id,
      razorpayCapturedAmount: payment.amount / 100,
      method: payment.card ? 'card' : payment.vpa ? 'upi' : 'netbanking',
      rawResponse: payment,
      userId: null // Will be read from PendingCheckout
    });
  } catch (err) {
    console.error(`Error processing payment.captured: ${err.message}`);
  }
};

const handlePaymentFailed = async (data) => {
  const payment = data.payload.payment.entity;
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) return;
  console.log(`Payment failed for Razorpay order: ${razorpayOrderId}`);

  // Clean up pending checkout if it exists
  try {
    const pendingCheckout = await PendingCheckout.findOne({
      where: { gateway_order_id: razorpayOrderId }
    });

    if (pendingCheckout) {
      await pendingCheckout.destroy();
      console.log(`Cleaned up pending checkout for failed payment: ${razorpayOrderId}`);
    }
  } catch (err) {
    console.error(`Error cleaning up pending checkout: ${err.message}`);
  }
};

const handleOrderPaid = async (data) => {
  const orderData = data.payload.order.entity;
  if (!orderData || !orderData.id) return;

  console.log(`Order paid: ${orderData.id}`);

  try {
    await processSuccessfulPayment({
      gatewayOrderId: orderData.id,
      gatewayPaymentId: null, // No payment ID in order.paid
      razorpayCapturedAmount: orderData.amount_paid / 100,
      method: 'razorpay',
      rawResponse: orderData,
      userId: null
    });
  } catch (err) {
    console.error(`Error processing order.paid: ${err.message}`);
  }
};

module.exports = {
  handleWebhook
};