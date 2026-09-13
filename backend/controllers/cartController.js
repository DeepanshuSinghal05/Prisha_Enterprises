const { Product, Order, OrderItem, Payment, Address, User, PendingCheckout, sequelize } = require('../models');
const { logError } = require('../utils/logger');
const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/razorpay');
const { processSuccessfulPayment } = require('../utils/paymentUtils');

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
const verifyMockPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // In real implementation, this would verify Razorpay signature
  // For testing, we always return true if parameters are present
  return !!razorpayOrderId && !!razorpayPaymentId && !!razorpaySignature;
};

const createCheckoutOrder = async (req, res) => {
  try {
    const { items, shippingAddress, addressId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to place an order'
      });
    }

    // LAYER 1: Validate stock BEFORE any payment or order creation
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({ where: { id: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products are not available'
      });
    }

    let calculatedTotal = 0;
    const itemsWithDetails = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // LAYER 1: Check stock availability BEFORE payment
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
        });
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
      return res.status(400).json({
        success: false,
        message: 'Order amount must be at least ₹1'
      });
    }

    // Create Razorpay order first, before making database changes.
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(Math.round(calculatedTotal));
    } catch (razorpayErr) {
      logError(razorpayErr, req);
      return res.status(503).json({
        success: false,
        message: 'Payment service temporarily unavailable. Please try again.'
      });
    }

    // Handle shipping address dedup with transaction guard
    let savedAddress = null;

    if (addressId) {
      savedAddress = await Address.findOne({
        where: { id: addressId, user_id: userId }
      });
      if (!savedAddress) {
        return res.status(400).json({ success: false, message: 'Selected address not found' });
      }
    } else if (shippingAddress) {
      const normalize = (str) => typeof str === 'string' ? str.trim().toLowerCase() : '';

      const normNew = {
        line1: normalize(shippingAddress.address_line1),
        line2: normalize(shippingAddress.address_line2 || ''),
        city: normalize(shippingAddress.city),
        state: normalize(shippingAddress.state),
        pincode: normalize(shippingAddress.pincode),
        phone: normalize(shippingAddress.phone)
      };

      await sequelize.transaction(async (t) => {
        // Lock the parent user row so concurrent checkouts for this customer
        // cannot both decide to create the same address.
        await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });

        const userAddresses = await Address.findAll({
          where: { user_id: userId },
          transaction: t
        });

        const existingAddress = userAddresses.find(addr => {
          return normalize(addr.address_line1) === normNew.line1 &&
                 normalize(addr.address_line2 || '') === normNew.line2 &&
                 normalize(addr.city) === normNew.city &&
                 normalize(addr.state) === normNew.state &&
                 normalize(addr.pincode) === normNew.pincode &&
                 normalize(addr.phone) === normNew.phone;
        });

        if (!existingAddress) {
          const isDefault = userAddresses.length === 0 || shippingAddress.is_default === true;

          if (isDefault) {
            await Address.update(
              { is_default: false },
              { where: { user_id: userId }, transaction: t }
            );
          }

          savedAddress = await Address.create({
            user_id: userId,
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            phone: shippingAddress.phone,
            is_default: isDefault
          }, { transaction: t });
        } else {
          savedAddress = existingAddress;
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Create PendingCheckout after the Razorpay order (to store checkout data for later)
    try {
      await PendingCheckout.create({
        gateway_order_id: razorpayOrder.id,
        user_id: userId,
        items: JSON.stringify(itemsWithDetails),
        shipping_address: savedAddress ? JSON.stringify(savedAddress) : null,
        amount: calculatedTotal
      });
    } catch (pendingErr) {
      // If PendingCheckout fails, void the Razorpay order
      logError(pendingErr, req);
      // Note: In production, you would call razorpayOrder.fetch().then(o => o.cancel()) to void
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize checkout. Please try again.'
      });
    }

    // Get user for prefill data
    let userData = null;
    if (userId) {
      userData = await User.findByPk(userId);
    }

    res.json({
      success: true,
      message: 'Checkout initialized',
      checkout: {
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
        } : null,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID
      },
      user: userData ? {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      } : null
    });
  } catch (error) {
    logError(error, req);

    if (error.message && error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to initialize checkout. Please try again.'
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify payment signature using Razorpay
    const isSignatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature'
      });
    }

    // Process successful payment (idempotent)
    const result = await processSuccessfulPayment({
      gatewayOrderId: razorpayOrderId,
      gatewayPaymentId: razorpayPaymentId,
      razorpayCapturedAmount: null, // Will read from PendingCheckout
      method: 'razorpay',
      rawResponse: {},
      userId
    });

    if (result.alreadyProcessed) {
      return res.json({
        success: true,
        message: 'Payment already processed',
        order: {
          id: result.order.id,
          total_amount: result.order.total_amount,
          payment_status: result.order.payment_status,
          order_status: result.order.order_status
        }
      });
    }

    if (result.stockUnavailable) {
      return res.json({
        success: true,
        message: 'Order placed, but some items are unavailable. We will contact you soon.',
        order: {
          id: result.order.id,
          total_amount: result.order.total_amount,
          payment_status: result.order.payment_status,
          order_status: result.order.order_status,
          stock_unavailable: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: result.order.id,
        total_amount: result.order.total_amount,
        payment_status: result.order.payment_status,
        order_status: result.order.order_status
      }
    });
  } catch (error) {
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
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Mock payment is not available in production'
    });
  }

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