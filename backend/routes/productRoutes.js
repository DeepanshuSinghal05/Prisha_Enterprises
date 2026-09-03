const express = require('express');
const { validate, productValidators } = require('../middleware/validation');
const { getProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

// GET /api/products - List all products
router.get('/', validate(productValidators.list), getProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', validate(productValidators.getById), getProductById);

module.exports = router;
