const express = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const {
  getAddressList,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');
const { validate, addressValidators } = require('../middleware/validation');

const router = express.Router();

// GET /api/addresses - Get all addresses for current user
router.get('/', authenticate, requireAuth, getAddressList);

// GET /api/addresses/:id - Get single address details
router.get('/:id', authenticate, requireAuth, validate(addressValidators.getById), getAddressById);

// POST /api/addresses - Create new address
router.post('/', authenticate, requireAuth, validate(addressValidators.create), createAddress);

// PATCH /api/addresses/:id - Update address
router.patch('/:id', authenticate, requireAuth, validate(addressValidators.update), updateAddress);

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', authenticate, requireAuth, validate(addressValidators.getById), deleteAddress);

// PATCH /api/addresses/:id/default - Set as default address
router.patch('/:id/default', authenticate, requireAuth, validate(addressValidators.getById), setDefaultAddress);

module.exports = router;
