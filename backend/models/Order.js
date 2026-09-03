module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status'
    },
    payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'payment_id'
    },
    gateway_order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'gateway_order_id'
    },
    order_status: {
      type: DataTypes.ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'placed',
      field: 'order_status'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['payment_id'] },
      { fields: ['gateway_order_id'] }
    ]
  });

  return Order;
};
