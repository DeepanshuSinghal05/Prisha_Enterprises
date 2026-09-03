const { sequelize, Product } = require('../models');
const productsData = require('./productsData');

const seedProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database models synced');

    // Clear existing products
    await Product.destroy({ where: {} });
    console.log('Existing products cleared');

    // Insert new products
    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`Successfully seeded ${createdProducts.length} products`);

    createdProducts.forEach(p => {
      console.log(`  - ${p.name} (₹${p.price}) - Stock: ${p.stock_quantity}`);
    });

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedProducts();
