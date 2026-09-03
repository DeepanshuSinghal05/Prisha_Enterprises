module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Address = sequelize.define('Address', {
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
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'address_line1'
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        is: /^[0-9]{6}$/
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        is: /^[\+]?[0-9]{10,15}$/
      }
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'addresses',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  return Address;
};
