const { sequelize } = require('./models');

async function fixDatabase() {
  try {
    // Add stock_failures column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE orders ADD COLUMN stock_failures JSON NULL AFTER order_status
    `).catch(err => {
      if (err.message.includes('Duplicate')) {
        console.log('Column already exists');
      } else {
        throw err;
      }
    });

    console.log('Database fix completed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixDatabase();