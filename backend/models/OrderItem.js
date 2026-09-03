module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      field: 'order_id'
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      field: 'product_id'
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'price_at_purchase'
    }
  }, {
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
      { fields: ['product_id'] }
    ]
  });

  return OrderItem;
};
