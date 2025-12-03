const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../../src/database');

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await query(
      "SELECT id FROM \"user\" WHERE role = 'ADMIN' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin
    const username = 'admin';
    const email = 'admin@example.com';
    const password = process.argv[2] || process.env.ADMIN_PASSWORD;
    const role = 'ADMIN';

    if (!password) {
      console.error('❌ Error: Password required!');
      console.log('Usage: node create-admin.js <password>');
      console.log('   Or: ADMIN_PASSWORD=xxx node create-admin.js');
      process.exit(1);
    }

    console.log('Creating default admin user...');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('IMPORTANT: Change the password after first login!');

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await query(`
      INSERT INTO "user" (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `, [username, email, passwordHash, role]);

    const newUser = result.rows[0];
    console.log('Admin user created successfully:', newUser);
    console.log('You can now login with:', username, '/', password);

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createDefaultAdmin();