'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('customer', 'admin'),
        defaultValue: 'customer',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Products table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      screen_size: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: 'screen_size'
      },
      resolution: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      panel_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'panel_type'
      },
      os: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ram: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      rom: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      audio: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      hdmi_ports: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'hdmi_ports'
      },
      usb_ports: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'usb_ports'
      },
      aux_port: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'aux_port'
      },
      lan_port: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'lan_port'
      },
      wifi: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      bluetooth: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      smart_features: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'smart_features'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'image_url'
      },
      stock_quantity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 50,
        field: 'stock_quantity'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      }
    });

    // Orders table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        field: 'user_id'
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'payment_status'
      },
      payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'payment_id'
      },
      gateway_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'gateway_order_id'
      },
      order_status: {
        type: Sequelize.ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'placed',
        field: 'order_status'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      }
    });

    // OrderItems table
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        field: 'order_id'
      },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        field: 'product_id'
      },
      quantity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      price_at_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_at_purchase'
      }
    });

    // Payments table
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        field: 'order_id'
      },
      gateway_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        field: 'gateway_payment_id'
      },
      gateway_order_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'gateway_order_id'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      raw_response: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'raw_response'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      }
    });

    // Addresses table
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        field: 'user_id'
      },
      address_line1: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'address_line1'
      },
      address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'address_line2'
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      }
    });

    // AdminActionLogs table
    await queryInterface.createTable('admin_action_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      admin_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      target_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      target_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      old_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      new_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes
    await queryInterface.addIndex('products', ['stock_quantity']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['payment_id']);
    await queryInterface.addIndex('orders', ['gateway_order_id']);
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['product_id']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['gateway_payment_id']);
    await queryInterface.addIndex('payments', ['gateway_order_id']);
    await queryInterface.addIndex('addresses', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_action_logs');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('users');
  }
};