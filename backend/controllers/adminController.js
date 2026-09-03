const { Op } = require('sequelize');
const { logError } = require('../utils/logger');
const { Order, OrderItem, Product, User, Payment } = require('../models');
const { logAdminAction } = require('../middleware/adminAuth');

// Valid order status transitions
const VALID_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const adminController = {
  /**
   * Get all orders with search, filter, and pagination
   * GET /api/admin/orders
   * Query params: page, limit, search, status, dateFrom, dateTo, sortBy, sortOrder
   */
  async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = '',
        dateFrom = '',
        dateTo = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Build where clause
      const whereClause = {};

      // Search by order ID or customer name/email
      if (search) {
        whereClause[Op.or] = [
          { id: { [Op.like]: `%${search}%` } },
          { '$user.name$': { [Op.like]: `%${search}%` } },
          { '$user.email$': { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status && ORDER_STATUSES.includes(status)) {
        whereClause.order_status = status;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.created_at = {};
        if (dateFrom) {
          whereClause.created_at[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.created_at[Op.lte] = new Date(dateTo);
        }
      }

      // Valid sort fields
      const validSortFields = ['created_at', 'order_status', 'total_amount', 'id'];
      const validSortOrders = ['ASC', 'DESC'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const sortDir = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Include associations
      const include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'image_url']
          }]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'payment_method', 'payment_status', 'razorpay_payment_id']
        }
      ];

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include,
        limit: limitNum,
        offset,
        order: [[sortField, sortDir]],
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: count,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  },

  /**
   * Get order details by ID
   * GET /api/admin/orders/:id
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_url', 'description']
            }]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_method', 'payment_status', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'amount', 'created_at']
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
        data: { order }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details'
      });
    }
  },

  /**
   * Update order status
   * PATCH /api/admin/orders/:id/status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminId = req.adminId;
      const ipAddress = req.ip;

      // Validate status
      if (!status || !ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + ORDER_STATUSES.join(', ')
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const currentStatus = order.order_status;

      // Check if transition is valid
      const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from "${currentStatus}" to "${status}". Allowed transitions: ${allowedNextStatuses.join(', ') || 'none'}`
        });
      }

      // Store old value for logging
      const oldValue = { order_status: currentStatus };

      // Update order status
      order.order_status = status;
      await order.save();

      // Log the action
      await logAdminAction(
        adminId,
        'ORDER_STATUS_UPDATE',
        'order',
        id,
        oldValue,
        { order_status: status, notes },
        ipAddress
      );

      // Fetch updated order with associations
      const updatedOrder = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_url']
            }]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_method', 'payment_status', 'razorpay_payment_id']
          }
        ]
      });

      res.json({
        success: true,
        message: `Order status updated from "${currentStatus}" to "${status}"`,
        data: { order: updatedOrder }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  },

  /**
   * Get order statistics for dashboard
   * GET /api/admin/stats
   */
  async getStats(req, res) {
    try {
      const totalOrders = await Order.count();
      const pendingOrders = await Order.count({ where: { order_status: 'placed' } });
      const confirmedOrders = await Order.count({ where: { order_status: 'confirmed' } });
      const shippedOrders = await Order.count({ where: { order_status: 'shipped' } });
      const deliveredOrders = await Order.count({ where: { order_status: 'delivered' } });
      const cancelledOrders = await Order.count({ where: { order_status: 'cancelled' } });

      // Total revenue from delivered orders
      const revenueResult = await Order.findAll({
        where: { order_status: 'delivered' },
        attributes: [[require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total']]
      });
      const totalRevenue = revenueResult[0]?.dataValues?.total || 0;

      // Recent orders (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentOrders = await Order.count({
        where: {
          created_at: { [Op.gte]: sevenDaysAgo }
        }
      });

      // Last 30 days revenue trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const revenueTrend = await Order.findAll({
        where: {
          created_at: { [Op.gte]: thirtyDaysAgo },
          order_status: 'delivered'
        },
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'date'],
          [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'revenue'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'orders']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('created_at'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'ASC']],
        raw: true
      });

      // Orders by status distribution
      const ordersByStatus = {
        placed: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      };

      // Monthly revenue comparison (current vs previous month)
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const previousMonthStart = new Date(currentMonthStart);
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);

      const currentMonthRevenue = await Order.findAll({
        where: {
          created_at: { [Op.gte]: currentMonthStart },
          order_status: 'delivered'
        },
        attributes: [[require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total']]
      });

      const previousMonthRevenue = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: previousMonthStart,
            [Op.lt]: currentMonthStart
          },
          order_status: 'delivered'
        },
        attributes: [[require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total']]
      });

      const currentRevenue = parseFloat(currentMonthRevenue[0]?.dataValues?.total || 0);
      const previousRevenue = parseFloat(previousMonthRevenue[0]?.dataValues?.total || 0);
      const revenueGrowth = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
        : 0;

      // Top selling products
      const { OrderItem } = require('../models');
      const topProducts = await OrderItem.findAll({
        attributes: [
          'product_id',
          [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'total_sold'],
          [require('sequelize').fn('SUM', require('sequelize').literal('price * quantity')), 'total_revenue']
        ],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url']
        }],
        group: ['product_id', 'product.id', 'product.name', 'product.image_url'],
        order: [[require('sequelize').literal('total_sold'), 'DESC']],
        limit: 5,
        raw: false
      });

      res.json({
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: parseFloat(totalRevenue) || 0,
          recentOrders,
          revenueTrend,
          ordersByStatus,
          currentMonthRevenue: currentRevenue,
          previousMonthRevenue: previousRevenue,
          revenueGrowth: parseFloat(revenueGrowth),
          topProducts
        }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  },

  /**
   * Admin login
   * POST /api/admin/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find admin user
      const user = await User.findOne({ where: { email, role: 'admin' } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Generate JWT tokens using secure utility functions
      const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken({ id: user.id });

      // Set httpOnly cookies
      res.cookie('admin_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('admin_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Log login action
      await logAdminAction(user.id, 'ADMIN_LOGIN', 'admin', user.id, null, { email: user.email }, req.ip);

      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  },

  /**
   * Admin logout
   * POST /api/admin/logout
   */
  async logout(req, res) {
    try {
      // Clear cookies
      res.clearCookie('admin_token');
      res.clearCookie('admin_refresh_token');

      if (req.adminId) {
        await logAdminAction(req.adminId, 'ADMIN_LOGOUT', 'admin', req.adminId, null, null, req.ip);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  /**
   * Get current admin profile
   * GET /api/admin/me
   */
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          admin: {
            id: req.admin.id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role
          }
        }
      });
    } catch (error) {
      logError(error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }
};

module.exports = adminController;