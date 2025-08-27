const bcrypt = require('bcryptjs');
const { query } = require('../database');

const createAdminUser = async () => {
  try {
    console.log('🔄 Creating default admin user...');

    const adminUsername = 'admin';
    const adminEmail = 'admin@n8nautomation.local';
    const adminPassword = 'admin123'; // Change this in production!

    // Check if admin user already exists
    const existingAdmin = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [adminUsername, adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const result = await query(`
      INSERT INTO users (username, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role, created_at
    `, [adminUsername, adminEmail, passwordHash, 'admin', true]);

    const adminUser = result.rows[0];

    console.log('✅ Admin user created successfully:');
    console.log('   Username:', adminUser.username);
    console.log('   Email:', adminUser.email);
    console.log('   Password:', adminPassword);
    console.log('   Role:', adminUser.role);
    console.log('   Created:', adminUser.created_at);
    console.log('');
    console.log('🔒 IMPORTANT: Change the default password after first login!');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
};

module.exports = { createAdminUser };

// Run if this file is executed directly
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}