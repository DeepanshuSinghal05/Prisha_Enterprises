const Razorpay = require('razorpay');
const crypto = require('crypto');

// Lazy initialization to avoid throwing error during module import
// Environment variables are loaded after dotenv.config() in server.js
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');

  return expectedSignature === razorpay_signature;
};

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(payload));
  const computedSignature = shasum.digest('hex');

  return computedSignature === signature;
};

const createRazorpayOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100, // Convert to paise
    currency: currency,
    receipt: `order_${Date.now()}`,
    payment_capture: 1
  };

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    const errorMsg = error.error ? error.error.description || error.error.code : error.message || 'Unknown Razorpay Error';
    throw new Error(`Failed to create Razorpay order: ${errorMsg}`);
  }
};

module.exports = {
  getRazorpayInstance,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRazorpayOrder
};
