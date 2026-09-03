module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        is: /^[\+]?[0-9]{10,15}$/
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      defaultValue: 'customer',
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true
  });

  return User;
};
