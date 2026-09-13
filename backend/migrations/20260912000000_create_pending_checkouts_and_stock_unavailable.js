'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create pending_checkouts table
    await queryInterface.createTable('pending_checkouts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      gateway_order_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      items: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add index on gateway_order_id
    await queryInterface.addIndex('pending_checkouts', ['gateway_order_id']);

    // Add index on user_id
    await queryInterface.addIndex('pending_checkouts', ['user_id']);

    // Add stock_unavailable to order_status enum (MySQL requires recreating the column)
    // First, check current enum values
    const [results] = await queryInterface.sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'order_status'
    `);

    if (results.length > 0) {
      const currentType = results[0].COLUMN_TYPE;
      // Check if stock_unavailable already exists
      if (!currentType.includes('stock_unavailable')) {
        // Modify the enum to include stock_unavailable
        await queryInterface.sequelize.query(`
          ALTER TABLE orders MODIFY COLUMN order_status
          ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'stock_unavailable')
          NOT NULL DEFAULT 'placed'
        `);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop pending_checkouts table
    await queryInterface.dropTable('pending_checkouts');

    // Revert order_status enum
    await queryInterface.sequelize.query(`
      ALTER TABLE orders MODIFY COLUMN order_status
      ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')
      NOT NULL DEFAULT 'placed'
    `);
  }
};