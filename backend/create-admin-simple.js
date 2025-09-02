const bcrypt = require('bcryptjs');
const { query } = require('./database');

const createAdmin = async () => {
  try {
    console.log('🔄 Creating admin user...');
    
    // Hash password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Try to create admin user
    const result = await query(`
      INSERT INTO users (username, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role
      RETURNING id, username, email, role
    `, ['admin', 'admin@example.com', passwordHash, 'ADMIN', true]);
    
    console.log('✅ Admin user created/updated:', result.rows[0]);
    console.log('📝 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: ADMIN');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();