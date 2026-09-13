const { sequelize, Product, Order, OrderItem, Payment, PendingCheckout, User } = require('./models');
const { processSuccessfulPayment } = require('./utils/paymentUtils');

async function resetStock() {
  await Product.update({ stock_quantity: 50 }, { where: { id: [1, 2] } });
  console.log('Reset stock for products 1 and 2 to 50');
}

async function reportState(scenarioName) {
  console.log(`\n=== RESULTS: ${scenarioName} ===`);
  const orders = await Order.findAll({ order: [['id', 'DESC']], limit: 1 });
  const pendingCheckouts = await PendingCheckout.count();
  const prod1 = await Product.findByPk(1);
  const prod2 = await Product.findByPk(2);

  if (orders.length > 0) {
    const o = orders[0];
    console.log(`Order created: YES (ID: ${o.id})`);
    console.log(`Status: payment=${o.payment_status}, order=${o.order_status}`);
    console.log(`Gateway Order ID: ${o.gateway_order_id}`);

    const items = await OrderItem.findAll({ where: { order_id: o.id } });
    console.log(`Order Items: ${items.length}`);
  } else {
    console.log(`Order created: NO`);
  }

  console.log(`Pending Checkouts: ${pendingCheckouts}`);
  console.log(`Product 1 Stock: ${prod1.stock_quantity}`);
  console.log(`Product 2 Stock: ${prod2.stock_quantity}`);
  console.log('====================================\n');
}

async function runScenarios() {
  try {
    // Make sure we have a user
    let testUser = await User.findByPk(1);
    if (!testUser) {
      testUser = await User.create({
        id: 1, name: 'Test User', email: 'test@example.com', password_hash: 'hash', role: 'customer'
      });
    }

    // 1. Normal Checkout Success
    console.log('\n--- Scenario 1: Normal Checkout Success ---');
    await resetStock();

    // Create pending checkout
    const scen1Id = 'order_scen1_' + Date.now();
    await PendingCheckout.create({
      gateway_order_id: scen1Id,
      user_id: 1,
      items: JSON.stringify([{ productId: 1, quantity: 2, priceAtPurchase: 100 }]),
      amount: 200
    });

    // Process payment
    await processSuccessfulPayment({
      gatewayOrderId: scen1Id,
      gatewayPaymentId: 'pay_scen1_' + Date.now(),
      razorpayCapturedAmount: 200,
      method: 'card',
      userId: 1
    });

    await reportState('Scenario 1 (Normal Checkout)');

    // 2. Exact Stock Available
    console.log('\n--- Scenario 2: Exact Stock Available ---');
    await resetStock();
    await Product.update({ stock_quantity: 5 }, { where: { id: 1 } });

    const scen2Id = 'order_scen2_' + Date.now();
    await PendingCheckout.create({
      gateway_order_id: scen2Id,
      user_id: 1,
      items: JSON.stringify([{ productId: 1, quantity: 5, priceAtPurchase: 100 }]),
      amount: 500
    });

    await processSuccessfulPayment({
      gatewayOrderId: scen2Id,
      gatewayPaymentId: 'pay_scen2_' + Date.now(),
      razorpayCapturedAmount: 500,
      method: 'card',
      userId: 1
    });

    await reportState('Scenario 2 (Exact Stock)');

    // 3. Duplicate Payment Request (Idempotency)
    console.log('\n--- Scenario 3: Duplicate Payment Request (Idempotency) ---');
    // Using the same order ID from scenario 2
    const result3 = await processSuccessfulPayment({
      gatewayOrderId: scen2Id, // Same as before
      gatewayPaymentId: 'pay_scen3_duplicate', // New payment ID but same order
      razorpayCapturedAmount: 500
    });

    console.log(`Idempotency result: alreadyProcessed=${result3.alreadyProcessed}`);
    const origOrder = await Order.findOne({ where: { gateway_order_id: scen2Id } });
    console.log(`Original order payment status: ${origOrder.payment_status}`);

    const p1 = await Product.findByPk(1);
    console.log(`Product 1 Stock (should still be 0): ${p1.stock_quantity}`);

    // 4. Stock Becomes Unavailable During Payment
    console.log('\n--- Scenario 4: Stock Becomes Unavailable During Payment ---');
    await resetStock();

    const scen4Id = 'order_scen4_' + Date.now();
    await PendingCheckout.create({
      gateway_order_id: scen4Id,
      user_id: 1,
      items: JSON.stringify([{ productId: 1, quantity: 2, priceAtPurchase: 100 }]),
      amount: 200
    });

    // Simulate someone else buying the stock while user is on Razorpay screen
    await Product.update({ stock_quantity: 1 }, { where: { id: 1 } });
    console.log('Simulated stock reduction to 1 (user wants 2)');

    await processSuccessfulPayment({
      gatewayOrderId: scen4Id,
      gatewayPaymentId: 'pay_scen4_' + Date.now(),
      razorpayCapturedAmount: 200,
      method: 'card',
      userId: 1
    });

    await reportState('Scenario 4 (Stock Unavailable After Payment)');

    // 5. Payment Fails (or user closes modal)
    console.log('\n--- Scenario 5: Payment Fails/Aborted ---');
    await resetStock();

    const scen5Id = 'order_scen5_' + Date.now();
    await PendingCheckout.create({
      gateway_order_id: scen5Id,
      user_id: 1,
      items: JSON.stringify([{ productId: 1, quantity: 2, priceAtPurchase: 100 }]),
      amount: 200
    });

    console.log('Webhook receives payment.failed...');
    // Simulate paymentController handling failure
    const pending = await PendingCheckout.findOne({ where: { gateway_order_id: scen5Id } });
    if (pending) await pending.destroy();

    console.log('PendingCheckout destroyed by webhook handlers');
    await reportState('Scenario 5 (Payment Aborted)');

    // 6. Multiple items, one goes out of stock
    console.log('\n--- Scenario 6: Multiple items, partial stock out ---');
    await resetStock();

    const scen6Id = 'order_scen6_' + Date.now();
    await PendingCheckout.create({
      gateway_order_id: scen6Id,
      user_id: 1,
      items: JSON.stringify([
        { productId: 1, quantity: 2, priceAtPurchase: 100 },
        { productId: 2, quantity: 2, priceAtPurchase: 200 }
      ]),
      amount: 600
    });

    // Product 1 goes out of stock, Product 2 is still available
    await Product.update({ stock_quantity: 0 }, { where: { id: 1 } });

    await processSuccessfulPayment({
      gatewayOrderId: scen6Id,
      gatewayPaymentId: 'pay_scen6_' + Date.now(),
      razorpayCapturedAmount: 600,
      method: 'card',
      userId: 1
    });

    await reportState('Scenario 6 (Partial Stock Out)');

    // Clean up test data
    await Order.destroy({ where: { gateway_order_id: [scen1Id, scen2Id, scen4Id, scen6Id] } });
    await Product.update({ stock_quantity: 50 }, { where: { id: [1, 2] } });

    console.log('\nAll scenarios completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runScenarios();