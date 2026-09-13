const { Order, OrderItem, Product, Payment, User, Address } = require('../models');
const { logError } = require('../utils/logger');
const { verifyPaymentSignature } = require('../utils/razorpay');

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;

    const where = { user_id: userId };

    // Default to showing only confirmed orders unless a specific status is requested
    if (status) {
      where.order_status = status;
    } else {
      where.order_status = 'confirmed';
    }

    const orders = await Order.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'gateway_payment_id', 'amount', 'status', 'method', 'created_at']
        }
      ]
    });

    const total = await Order.count({ where });

    res.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id,
        total_amount: o.total_amount,
        payment_status: o.payment_status,
        order_status: o.order_status,
        created_at: o.created_at,
        shipped_at: o.shipped_at,
        delivered_at: o.delivered_at,
        shipping_address: o.shipping_address,
        items: o.items.map(oi => ({
          id: oi.id,
          product_id: oi.product_id,
          quantity: oi.quantity,
          price_at_purchase: oi.price_at_purchase,
          product: {
            id: oi.product.id,
            name: oi.product.name,
            image_url: oi.product.image_url,
            screen_size: oi.product.screen_size
          }
        })),
        payment: o.payment && o.payment.length > 0 ? {
          id: o.payment[0].id,
          gateway_payment_id: o.payment[0].gateway_payment_id,
          amount: o.payment[0].amount,
          status: o.payment[0].status,
          method: o.payment[0].method,
          created_at: o.payment[0].created_at
        } : null
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'gateway_payment_id', 'gateway_order_id', 'amount', 'status', 'method', 'raw_response', 'created_at']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        payment_id: order.payment_id,
        gateway_order_id: order.gateway_order_id,
        created_at: order.created_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        shipping_address: order.shipping_address,
        items: order.items.map(oi => ({
          id: oi.id,
          product_id: oi.product_id,
          quantity: oi.quantity,
          price_at_purchase: oi.price_at_purchase,
          product: {
            id: oi.product.id,
            name: oi.product.name,
            image_url: oi.product.image_url,
            screen_size: oi.product.screen_size,
            resolution: oi.product.resolution,
            price: oi.product.price
          }
        })),
        payment: order.payment && order.payment.length > 0 ? {
          id: order.payment[0].id,
          gateway_payment_id: order.payment[0].gateway_payment_id,
          gateway_order_id: order.payment[0].gateway_order_id,
          amount: order.payment[0].amount,
          status: order.payment[0].status,
          method: order.payment[0].method,
          raw_response: order.payment[0].raw_response,
          created_at: order.payment[0].created_at
        } : null
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
};

module.exports = {
  getMyOrders,
  getOrderById
};
