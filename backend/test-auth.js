const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function testAuth() {
  await sequelize.authenticate();
  
  // Create an admin if not exists
  const adminEmail = 'admin@prishaenterprises.com';
  let admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password_hash: hashedPassword,
      phone: '0000000000',
      role: 'admin',
      is_verified: true
    });
    console.log('Created admin user successfully');
  }

  const userEmail = 'testcustomer@test.com'
  let user = await User.findOne({ where: { email: userEmail }});
  if (!user) {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    user = await User.create({
      name: 'Existing Customer',
      email: userEmail,
      password_hash: hashedPassword,
      phone: '9123456789',
      role: 'customer',
      is_verified: true
    });
    console.log('Created customer user successfully');
  }

  console.log('Auth setup complete');
  process.exit(0);
}

testAuth().catch(e => { console.error(e); process.exit(1); });
