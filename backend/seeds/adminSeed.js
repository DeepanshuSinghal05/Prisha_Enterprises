const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Wait for the sync to complete to ensure columns exist
    await sequelize.sync({ alter: true });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@prishaenterprises.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const password_hash = await bcrypt.hash('Admin@123', 12);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@prishaenterprises.com',
      phone: '9999999999',
      password_hash,
      role: 'admin'
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@prishaenterprises.com');
    console.log('Password: Admin@123');
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();