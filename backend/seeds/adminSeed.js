const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const DEFAULT_ADMIN_EMAIL = 'admin@prishaenterprises.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Wait for the sync to complete to ensure columns exist
    await sequelize.sync({ alter: true });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: DEFAULT_ADMIN_EMAIL,
      phone: '9999999999',
      password_hash,
      role: 'admin'
    });

    console.log('Admin user created successfully:');
    console.log('Email:', DEFAULT_ADMIN_EMAIL);
    console.log('Password:', DEFAULT_ADMIN_PASSWORD);
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);
    console.log('');
    console.log('⚠️  WARNING: Default admin credentials detected!');
    console.log('   Please change the password immediately after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();