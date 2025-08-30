const bcrypt = require('bcryptjs');
const { query } = require('./database');

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin
    const username = 'admin';
    const email = 'admin@example.com';
    const password = '1qaz@WSX';
    const role = 'admin';

    console.log('Creating default admin user...');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('IMPORTANT: Change the password after first login!');

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await query(`
      INSERT INTO users (username, email, password_hash, role)
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