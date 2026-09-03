const { Product, Order, OrderItem, Payment, Address, User, sequelize } = require('../models');
const { logError } = require('../utils/logger');
const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/razorpay');

// Mock Razorpay order creation (for testing without Razorpay API)
const createMockRazorpayOrder = async (amount, currency = 'INR') => {
  return {
    id: `order_mock_${Date.now()}`,
    entity: 'order',
    amount: amount * 100,
    amount_paid: 0,
    amount_due: amount * 100,
    currency: currency,
    receipt: `rcpt_mock_${Date.now()}`,
    status: 'created',
    attempts: 0,
    notes: [],
    created_at: Date.now()
  };
};

// Mock payment verification (for testing without Razorpay API)
const verifyMockPayment = (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // In real implementation, this would verify Razorpay signature
  // For testing, we always return true if parameters are present
  return !!orderId && !!razorpayOrderId && !!razorpayPaymentId && !!razorpaySignature;
};

const createCheckoutOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Fetch products and validate
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
      lock: true
    });

    if (products.length !== items.length) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Some products are not available'
      });
    }

    // Validate stock and calculate totals
    let calculatedTotal = 0;
    const itemsWithDetails = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
      }

      // Calculate line total
      const lineTotal = product.price * item.quantity;
      calculatedTotal += lineTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        productName: product.name
      };
    });

    // Validate minimum amount (Razorpay requires minimum 100 paise / 1 INR)
    if (calculatedTotal < 1) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order amount must be at least ₹1'
      });
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      total_amount: calculatedTotal,
      payment_status: 'pending',
      order_status: 'placed'
    }, { transaction: t });

    // Create order items
    for (const item of itemsWithDetails) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.priceAtPurchase
      }, { transaction: t });

      // Decrement stock
      await Product.decrement('stock_quantity', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t
      });
    }

    // Save shipping address to database
    let savedAddress = null;
    if (shippingAddress) {
      // Check if address exists for user
      const existingAddress = await Address.findOne({
        where: {
          user_id: userId,
          address_line1: shippingAddress.address_line1,
          city: shippingAddress.city,
          state: shippingAddress.state
        }
      });

      if (!existingAddress) {
        savedAddress = await Address.create({
          user_id: userId,
          address_line1: shippingAddress.address_line1,
          address_line2: shippingAddress.address_line2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
          is_default: shippingAddress.is_default !== undefined ? shippingAddress.is_default : true
        }, { transaction: t });
      } else {
        savedAddress = existingAddress;
      }
    }

    await t.commit();

    // Create Razorpay order using real Razorpay API
    // Ensure amount is integer (paise)
    const razorpayOrder = await createRazorpayOrder(Math.round(calculatedTotal));

    // Get user for prefill data
    let userData = null;
    if (userId) {
      userData = await User.findByPk(userId);
    }


    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: calculatedTotal * 100, // Convert to paise for frontend
        currency: 'INR',
        items: itemsWithDetails.map(i => ({
          productId: i.productId,
          name: i.productName,
          quantity: i.quantity,
          price: i.priceAtPurchase
        })),
        shippingAddress: savedAddress ? {
          address_line1: savedAddress.address_line1,
          address_line2: savedAddress.address_line2,
          city: savedAddress.city,
          state: savedAddress.state,
          pincode: savedAddress.pincode,
          phone: savedAddress.phone,
          is_default: savedAddress.is_default
        } : shippingAddress,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID
      },
      user: userData ? {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      } : null
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    logError(error, req);

    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order. Please try again. Detailed error: ' + error.message
    });
  }
};

const verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user ? req.user.id : null;

    // Verify order belongs to user FIRST to prevent IDOR and enumeration
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order || order.user_id !== userId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // THEN Verify payment signature using Razorpay
    const isSignatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isSignatureValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Check if payment already processed (idempotency)
    const existingPayment = await Payment.findOne({
      where: { gateway_payment_id: razorpayPaymentId },
      transaction: t
    });

    if (existingPayment) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    // Update order status to paid
    await order.update({
      payment_status: 'paid',
      payment_id: razorpayPaymentId,
      gateway_order_id: razorpayOrderId
    }, { transaction: t });

    // Create payment record
    const payment = await Payment.create({
      order_id: orderId,
      gateway_payment_id: razorpayPaymentId,
      gateway_order_id: razorpayOrderId,
      amount: order.total_amount,
      status: 'captured',
      method: 'razorpay'
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        payment_id: razorpayPaymentId
      }
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    logError(error, req);

    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please try again.'
    });
  }
};

const getCart = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Frontend cart state'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_quantity} units available`
      });
    }

    res.json({
      success: true,
      message: 'Cart updated',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock_quantity: product.stock_quantity,
        maxQuantity: quantity
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// Mock payment without Razorpay - creates order and marks as paid immediately
const processMockPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Fetch products and validate
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
      lock: true
    });

    if (products.length !== items.length) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Some products are not available'
      });
    }

    // Validate stock and calculate totals
    let calculatedTotal = 0;
    const itemsWithDetails = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
      }

      const lineTotal = product.price * item.quantity;
      calculatedTotal += lineTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        productName: product.name
      };
    });

    // Create order
    const order = await Order.create({
      user_id: userId,
      total_amount: calculatedTotal,
      payment_status: 'paid', // Paid immediately in mock mode
      order_status: 'confirmed' // Confirmed immediately in mock mode
    }, { transaction: t });

    // Create order items
    for (const item of itemsWithDetails) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.priceAtPurchase
      }, { transaction: t });

      // Decrement stock
      await Product.decrement('stock_quantity', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order_id: order.id,
      gateway_payment_id: `mock_pay_${Date.now()}`,
      gateway_order_id: `mock_order_${Date.now()}`,
      amount: calculatedTotal,
      status: 'captured',
      method: 'cod', // Cash on Delivery as default for mock
      raw_response: { mock: true, note: 'Payment mocked for testing' }
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        payment_id: payment.gateway_payment_id,
        items: itemsWithDetails.map(i => ({
          productId: i.productId,
          name: i.productName,
          quantity: i.quantity,
          price: i.priceAtPurchase
        }))
      }
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    logError(error, req);

    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process order. Please try again.'
    });
  }
};

module.exports = {
  createCheckoutOrder,
  verifyPayment,
  getCart,
  updateCartQuantity,
  processMockPayment
};
