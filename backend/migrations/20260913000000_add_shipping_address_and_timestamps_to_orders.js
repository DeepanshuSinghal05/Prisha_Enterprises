'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add shipping_address column if it doesn't exist (paymentUtils.js may have already created it)
    const [columns] = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_address'`
    );
    if (columns.length === 0) {
      await queryInterface.addColumn('orders', 'shipping_address', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Add shipped_at column
    await queryInterface.addColumn('orders', 'shipped_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add delivered_at column
    await queryInterface.addColumn('orders', 'delivered_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'delivered_at');
    await queryInterface.removeColumn('orders', 'shipped_at');
    // Don't remove shipping_address in down — it may already have data from paymentUtils
  }
};
