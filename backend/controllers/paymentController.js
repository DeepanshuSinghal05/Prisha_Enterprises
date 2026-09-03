const { Payment, Order, sequelize } = require('../models');
const { logError, logSuspiciousTraffic } = require('../utils/logger');
const { verifyWebhookSignature } = require('../utils/razorpay');

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

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

const handlePaymentAuthorized = async (data) => {
  const payment = data.payload.payment.entity;
  const orderId = payment.order_id;
  
  if (!orderId) {
    console.warn('Webhook authorized: missing order_id');
    return;
  }

  console.log(`Payment authorized for order: ${orderId}`);
  const order = await Order.findOne({
    where: { gateway_order_id: orderId }
  });

  // Verify amount matches
  if (order && order.payment_status === 'pending' && Math.round(order.total_amount * 100) === payment.amount) {
    await order.update({ payment_status: 'paid' });
  }
};

const handlePaymentCaptured = async (data) => {
  const payment = data.payload.payment.entity;
  const orderId = payment.order_id;
  
  if (!orderId) {
    console.warn('Webhook captured: missing order_id');
    return;
  }

  console.log(`Payment captured for order: ${orderId}`);

  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { gateway_order_id: orderId }
    }, { transaction: t });

    // Defense-in-depth: Verify amount matches to prevent logic bugs / payload manipulation
    if (order && Math.round(order.total_amount * 100) === payment.amount) {
      const existingPayment = await Payment.findOne({
        where: { gateway_payment_id: payment.id }
      }, { transaction: t });

      if (!existingPayment) {
        await Payment.create({
          order_id: order.id,
          gateway_payment_id: payment.id,
          gateway_order_id: orderId,
          amount: payment.amount / 100,
          status: 'captured',
          method: payment.card ? 'card' : payment.vpa ? 'upi' : 'netbanking',
          raw_response: payment
        }, { transaction: t });
      }

      if (order.payment_status !== 'paid') {
        await order.update({ payment_status: 'paid' }, { transaction: t });
      }
      await t.commit();
    } else {
      if (order) console.warn(`Amount mismatch in webhook captured: Expected ${order.total_amount * 100}, got ${payment.amount}`);
      await t.rollback();
    }
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const handlePaymentFailed = async (data) => {
  const payment = data.payload.payment.entity;
  const orderId = payment.order_id;

  if (!orderId) return;
  console.log(`Payment failed for order: ${orderId}`);

  const order = await Order.findOne({
    where: { gateway_order_id: orderId }
  });

  if (order && order.payment_status === 'pending') {
    await order.update({ payment_status: 'failed' });
  }
};

const handleOrderPaid = async (data) => {
  const orderData = data.payload.order.entity;
  if (!orderData || !orderData.id) return;

  console.log(`Order paid: ${orderData.id}`);

  const dbOrder = await Order.findOne({
    where: { gateway_order_id: orderData.id }
  });

  // Verify amount matches
  if (dbOrder && dbOrder.payment_status === 'pending' && Math.round(dbOrder.total_amount * 100) === orderData.amount) {
    await dbOrder.update({
      payment_status: 'paid',
      payment_id: orderData.receipt
    });
  }
};

module.exports = {
  handleWebhook
};
