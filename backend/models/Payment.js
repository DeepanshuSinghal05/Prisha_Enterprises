module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Payment = sequelize.define('Payment', {
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
    gateway_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'gateway_payment_id'
    },
    gateway_order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'gateway_order_id'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    raw_response: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'raw_response'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'payments',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
      { fields: ['gateway_payment_id'] },
      { fields: ['gateway_order_id'] }
    ]
  });

  return Payment;
};
