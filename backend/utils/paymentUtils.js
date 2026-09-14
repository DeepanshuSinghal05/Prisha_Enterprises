const { Order, OrderItem, Payment, PendingCheckout, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Idempotent function to process a successful payment.
 * Called by: verifyPayment (frontend path) and webhook handler (fallback path).
 *
 * @param {Object} params
 * @param {string} params.gatewayOrderId - Razorpay order ID
 * @param {string} params.gatewayPaymentId - Razorpay payment ID
 * @param {number} params.razorpayCapturedAmount - Amount Razorpay says was captured (in rupees)
 * @param {string} params.method - Payment method (card, upi, netbanking)
 * @param {Object} params.rawResponse - Raw Razorpay response
 * @param {string} params.userId - User ID
 * @returns {Object} { alreadyProcessed, order, created, stockUnavailable }
 */
const processSuccessfulPayment = async ({
  gatewayOrderId,
  gatewayPaymentId,
  razorpayCapturedAmount,
  method = 'razorpay',
  rawResponse = {},
  userId
}) => {
  const t = await sequelize.transaction();

  try {
    // STEP 1: Check if Order already exists (idempotency)
    let order = await Order.findOne({
      where: { gateway_order_id: gatewayOrderId },
      transaction: t,
      lock: true
    });

    if (order) {
      if (order.payment_status === 'paid') {
        await t.rollback();
        return { alreadyProcessed: true, order };
      }
      // Legacy pending order from old flow
      await order.update({
        payment_status: 'paid',
        order_status: 'confirmed',
        payment_id: gatewayPaymentId
      }, { transaction: t });
      await t.commit();
      return { alreadyProcessed: false, order, legacyOrder: true };
    }

    // STEP 2: Fetch pending checkout
    const pendingCheckout = await PendingCheckout.findOne({
      where: { gateway_order_id: gatewayOrderId },
      transaction: t
    });

    if (!pendingCheckout) {
      await t.rollback();
      throw new Error('Checkout data not found. Please contact support.');
    }

    const items = JSON.parse(pendingCheckout.items);
    const shippingAddress = pendingCheckout.shipping_address
      ? JSON.parse(pendingCheckout.shipping_address)
      : null;
    const expectedAmount = parseFloat(pendingCheckout.amount);

    // STEP 3: Fraud check - verify amounts match
    if (razorpayCapturedAmount && Math.abs(razorpayCapturedAmount - expectedAmount) > 1) {
      // Log warning but don't block - Razorpay is source of truth
      console.warn(`Amount mismatch: expected ${expectedAmount}, captured ${razorpayCapturedAmount}`);
    }

    // STEP 4: Create Order
    try {
      order = await Order.create({
        user_id: userId || pendingCheckout.user_id, // Use pending checkout userId if not provided
        total_amount: expectedAmount,  // From PendingCheckout, not from caller
        payment_status: 'paid',
        order_status: 'confirmed',
        gateway_order_id: gatewayOrderId,
        payment_id: gatewayPaymentId,
        shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : null
      }, { transaction: t });
    } catch (createErr) {
      if (createErr.name === 'SequelizeUniqueConstraintError') {
        await t.rollback();
        order = await Order.findOne({ where: { gateway_order_id: gatewayOrderId } });
        return { alreadyProcessed: true, order };
      }
      throw createErr;
    }

    // STEP 5: Create OrderItems AND decrement stock (with safety + log manual refund)
    let orderStockUnavailable = false;

    for (const item of items) {
      // Always create order item record
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.priceAtPurchase,
        delivery_charge_at_purchase: item.deliveryChargeAtPurchase || 0
      }, { transaction: t });

      // Conditional stock decrement
      const [affectedRows] = await Product.update(
        { stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`) },
        {
          where: {
            id: item.productId,
            stock_quantity: { [Op.gte]: item.quantity }
          },
          transaction: t
        }
      );

      if (affectedRows === 0) {
        // STOCK FAILURE - Layer 2 triggered
        if (!order.stock_failures) {
          order.stock_failures = [];
        }
        order.stock_failures.push({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity
        });

        orderStockUnavailable = true;
      }
    }

    if (orderStockUnavailable) {
      await order.update({
        order_status: 'stock_unavailable'
      }, { transaction: t });

      // Log for admin attention
      await sequelize.query(`
        INSERT INTO admin_action_logs
        (admin_user_id, action_type, target_type, target_id, old_value, new_value, created_at)
        VALUES (1, 'STOCK_UNAVAILABLE_AFTER_PAYMENT', 'order', ?, ?, ?, NOW())
      `, {
        replacements: [
          order.id,
          JSON.stringify({ payment_id: gatewayPaymentId, amount: expectedAmount }),
          JSON.stringify(order.stock_failures)
        ],
        transaction: t
      });
    }

    // STEP 6: Create Payment record (idempotent)
    const existingPayment = await Payment.findOne({
      where: { gateway_payment_id: gatewayPaymentId },
      transaction: t
    });

    if (!existingPayment) {
      try {
        await Payment.create({
          order_id: order.id,
          gateway_payment_id: gatewayPaymentId,
          gateway_order_id: gatewayOrderId,
          amount: razorpayCapturedAmount || expectedAmount,
          status: 'captured', // Captured regardless of stock
          method: method,
          raw_response: rawResponse
        }, { transaction: t });
      } catch (payErr) {
        if (payErr.name !== 'SequelizeUniqueConstraintError') throw payErr;
      }
    }

    // STEP 7: Clean up pending checkout
    await pendingCheckout.destroy({ transaction: t });

    await t.commit();
    return {
      alreadyProcessed: false,
      order,
      created: true,
      stockUnavailable: orderStockUnavailable
    };

  } catch (error) {
    if (!t.finished) await t.rollback();
    throw error;
  }
};

module.exports = { processSuccessfulPayment };
