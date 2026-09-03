const { body, param, query, validationResult } = require('express-validator');

// Validation schemas
const authValidators = {
  signup: [
    body('name')
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .trim()
      .matches(/^[\+]?[0-9]{10,15}$/)
      .withMessage('Please provide a valid phone number'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  login: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .exists()
      .withMessage('Password is required')
  ]
};

const cartValidators = {
  checkout: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Cart must contain at least one item'),
    body('items.*.productId')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required')
  ],
  payment: [
    body('orderId').isInt({ min: 1 }).withMessage('Valid application order ID is required'),
    body('razorpayOrderId').isString().trim().escape().notEmpty().withMessage('Razorpay Order ID is required'),
    body('razorpayPaymentId').isString().trim().escape().notEmpty().withMessage('Razorpay Payment ID is required'),
    body('razorpaySignature').isString().trim().escape().notEmpty().withMessage('Razorpay Signature is required')
  ],
  mockPayment: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Cart must contain at least one item'),
    body('items.*.productId')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required')
  ]
};

// Product query validators
const productValidators = {
  list: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a non-negative number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a non-negative number')
      .custom((value, { req }) => {
        if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
          throw new Error('Maximum price must be greater than or equal to minimum price');
        }
        return true;
      }),
    query('inStock')
      .optional()
      .isIn(['true', 'false', '1', '0'])
      .withMessage('inStock must be true or false')
  ],
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer')
  ]
};

// Order validators
const orderValidators = {
  list: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
    query('status')
      .optional()
      .isIn(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer')
  ]
};

// Address validators
const addressValidators = {
  create: [
    body('address_line1')
      .trim()
      .escape()
      .isLength({ min: 5, max: 255 })
      .withMessage('Address line 1 is required'),
    body('address_line2')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 255 }),
    body('city')
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('City is required'),
    body('state')
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('State is required'),
    body('pincode')
      .trim()
      .matches(/^[0-9]{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('phone')
      .trim()
      .matches(/^[\+]?[0-9]{10,15}$/)
      .withMessage('Please provide a valid phone number')
  ],
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Address ID must be a positive integer'),
    body('address_line1')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 5, max: 255 })
      .withMessage('Address line 1 must be between 5 and 255 characters'),
    body('address_line2')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 255 }),
    body('city')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('state')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    body('pincode')
      .optional()
      .trim()
      .matches(/^[0-9]{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[0-9]{10,15}$/)
      .withMessage('Please provide a valid phone number')
  ],
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Address ID must be a positive integer')
  ]
};

// Admin validators
const adminValidators = {
  login: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .exists()
      .withMessage('Password is required')
  ],
  getOrders: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 100 })
      .withMessage('Search term must be less than 100 characters'),
    query('status')
      .optional()
      .isIn(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for dateFrom'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for dateTo')
      .custom((value, { req }) => {
        if (req.query.dateFrom && new Date(value) < new Date(req.query.dateFrom)) {
          throw new Error('dateTo must be greater than or equal to dateFrom');
        }
        return true;
      }),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'order_status', 'total_amount', 'id'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('Sort order must be ASC or DESC')
  ],
  getOrderById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer')
  ],
  updateOrderStatus: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer'),
    body('status')
      .isIn(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('notes')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters')
  ]
};

// Error handler middleware
const validate = (validators) => {
  return async (req, res, next) => {
    await Promise.all(validators.map(p => p.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    next();
  };
};

module.exports = {
  authValidators,
  addressValidators,
  cartValidators,
  productValidators,
  orderValidators,
  adminValidators,
  validate
};