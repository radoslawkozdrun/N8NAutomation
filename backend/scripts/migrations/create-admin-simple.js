const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../../src/database');

const createAdmin = async () => {
  try {
    console.log('🔄 Creating admin user...');

    // Get password from argument or env
    const password = process.argv[2] || process.env.ADMIN_PASSWORD || 'admin123';

    if (!password) {
      console.error('❌ Error: Password required!');
      console.log('Usage: node create-admin-simple.js <password>');
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);

    // Try to create admin user
    const result = await query(`
      INSERT INTO "user" (username, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role
      RETURNING id, username, email, role
    `, ['admin', 'admin@example.com', passwordHash, 'ADMIN', true]);

    console.log('✅ Admin user created/updated:', result.rows[0]);
    console.log('📝 Username: admin');
    console.log('🔑 Password:', password);
    console.log('🎯 Role: ADMIN');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();