const { Product } = require('../models');
const { logError } = require('../utils/logger');

const getProducts = async (req, res) => {
  try {
    const { limit = 20, offset = 0, minPrice, maxPrice, inStock } = req.query;

    const where = {};

    if (minPrice) {
      where.price = { ...where.price, $gte: minPrice };
    }

    if (maxPrice) {
      where.price = { ...where.price, $lte: maxPrice };
    }

    if (inStock === 'true') {
      where.stock_quantity = { $gt: 0 };
    }

    const products = await Product.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    const total = await Product.count({ where });

    res.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        screen_size: p.screen_size,
        resolution: p.resolution,
        panel_type: p.panel_type,
        os: p.os,
        ram: p.ram,
        rom: p.rom,
        audio: p.audio,
        hdmi_ports: p.hdmi_ports,
        usb_ports: p.usb_ports,
        aux_port: p.aux_port,
        lan_port: p.lan_port,
        wifi: p.wifi,
        bluetooth: p.bluetooth,
        smart_features: p.smart_features,
        price: p.price,
        image_url: p.image_url,
        stock_quantity: p.stock_quantity
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < total
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        screen_size: product.screen_size,
        resolution: product.resolution,
        panel_type: product.panel_type,
        os: product.os,
        ram: product.ram,
        rom: product.rom,
        audio: product.audio,
        hdmi_ports: product.hdmi_ports,
        usb_ports: product.usb_ports,
        aux_port: product.aux_port,
        lan_port: product.lan_port,
        wifi: product.wifi,
        bluetooth: product.bluetooth,
        smart_features: product.smart_features,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details'
    });
  }
};

module.exports = {
  getProducts,
  getProductById
};
