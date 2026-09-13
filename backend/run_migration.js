const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('Running migration: adding stock_failures column to orders table...');

    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'prisha_enterprises'
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'stock_failures'
    `);

    if (results.length === 0) {
      await sequelize.query(`
        ALTER TABLE orders ADD COLUMN stock_failures JSON NULL AFTER order_status
      `);
      console.log('✅ Added stock_failures column');
    } else {
      console.log('Column already exists');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

runMigration();