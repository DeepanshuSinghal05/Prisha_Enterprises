const { Address, User } = require('../models');
const { logError } = require('../utils/logger');

const getAddressList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const addresses = await Address.findAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['is_default', 'DESC'], ['created_at', 'ASC']]
    });

    const total = await Address.count({ where: { user_id: userId } });

    res.json({
      success: true,
      addresses: addresses.map(addr => ({
        id: addr.id,
        user_id: addr.user_id,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
        is_default: addr.is_default,
        created_at: addr.created_at
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
      message: 'Failed to fetch addresses'
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      address: {
        id: address.id,
        user_id: address.user_id,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: address.is_default,
        created_at: address.created_at
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

const createAddress = async (req, res) => {
  const t = await Address.sequelize.transaction();
  try {
    const userId = req.user.id;
    const {
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      phone,
      is_default = false
    } = req.body;

    // Validate required fields
    if (!address_line1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate pincode format
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be 6 digits'
      });
    }

    // If setting as default, unset existing default address
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId }, transaction: t }
      );
    }

    const address = await Address.create(
      {
        user_id: userId,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        pincode,
        phone,
        is_default
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: {
        id: address.id,
        user_id: address.user_id,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: address.is_default,
        created_at: address.created_at
      }
    });
  } catch (error) {
    await t.rollback();
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to add address'
    });
  }
};

const updateAddress = async (req, res) => {
  const t = await Address.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      phone,
      is_default
    } = req.body;

    let address = await Address.findOne({
      where: { id, user_id: userId },
      transaction: t,
      lock: true
    });

    if (!address) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Validate pincode format if provided
    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Pincode must be 6 digits'
      });
    }

    // If setting as default, unset existing default address
    if (is_default === true) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId }, transaction: t }
      );
    }

    // Update fields
    if (address_line1 !== undefined) address.address_line1 = address_line1;
    if (address_line2 !== undefined) address.address_line2 = address_line2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (phone !== undefined) address.phone = phone;
    if (is_default !== undefined) address.is_default = is_default;

    await address.save({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: {
        id: address.id,
        user_id: address.user_id,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: address.is_default,
        created_at: address.created_at
      }
    });
  } catch (error) {
    await t.rollback();
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
};

const deleteAddress = async (req, res) => {
  const t = await Address.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId },
      transaction: t
    });

    if (!address) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.destroy({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    await t.rollback();
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

const setDefaultAddress = async (req, res) => {
  const t = await Address.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // First, unset all addresses as default
    await Address.update(
      { is_default: false },
      { where: { user_id: userId }, transaction: t }
    );

    // Then set the specified address as default
    const address = await Address.findOne({
      where: { id, user_id: userId },
      transaction: t,
      lock: true
    });

    if (!address) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.update({ is_default: true }, { transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: 'Default address updated',
      address: {
        id: address.id,
        is_default: address.is_default
      }
    });
  } catch (error) {
    await t.rollback();
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to update default address'
    });
  }
};

module.exports = {
  getAddressList,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
