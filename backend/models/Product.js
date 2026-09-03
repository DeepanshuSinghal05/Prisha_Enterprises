module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    screen_size: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'screen_size'
    },
    resolution: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    panel_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'panel_type'
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ram: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rom: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    audio: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    hdmi_ports: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'hdmi_ports'
    },
    usb_ports: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'usb_ports'
    },
    aux_port: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'aux_port'
    },
    lan_port: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'lan_port'
    },
    wifi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    bluetooth: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    smart_features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'smart_features'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url'
    },
    stock_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 50,
      field: 'stock_quantity'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'products',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['stock_quantity'] },
      { fields: ['price'] }
    ]
  });

  return Product;
};
