const { Sequelize } = require('sequelize');
const config = require('../config/config');
require('dotenv').config();

const databaseName = process.env.DB_NAME || config.development.database;
const database = config[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(databaseName, database.username, database.password, {
  host: database.host,
  port: database.port,
  dialect: 'mysql',
  logging: console.log,
  dialectOptions: {
    bigNumberStrings: true
  }
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Model definitions
const User = require('./User')(sequelize);
const Product = require('./Product')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Payment = require('./Payment')(sequelize);
const Address = require('./Address')(sequelize);
const AdminActionLog = require('./AdminActionLog')(sequelize);

// Associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(Address, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(AdminActionLog, { foreignKey: 'admin_user_id', onDelete: 'CASCADE' });

  // AdminActionLog associations
  AdminActionLog.belongsTo(User, { foreignKey: 'admin_user_id', as: 'admin' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
  Order.hasMany(Payment, { foreignKey: 'order_id', onDelete: 'CASCADE' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

  // Payment associations
  Payment.belongsTo(Order, { foreignKey: 'order_id' });

  // Address associations
  Address.belongsTo(User, { foreignKey: 'user_id' });

  // Product associations
  Product.hasMany(OrderItem, { foreignKey: 'product_id' });
};

defineAssociations();

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Payment,
  Address,
  AdminActionLog,
  testConnection
};
