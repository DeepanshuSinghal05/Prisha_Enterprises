module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const PendingCheckout = sequelize.define('PendingCheckout', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    gateway_order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'gateway_order_id'
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
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'items'
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'shipping_address'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'pending_checkouts',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['gateway_order_id'] }
    ]
  });

  return PendingCheckout;
};