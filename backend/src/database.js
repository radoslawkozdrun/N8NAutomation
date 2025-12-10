const { Pool } = require('pg');
const config = require('./config');

// Database connection pool using centralized configuration
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
  acquireTimeoutMillis: config.database.pool.acquireTimeoutMillis,
});

// Test database connection
pool.on('connect', (client) => {
  console.log('🔗 Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query executed in ${duration}ms:`, text.slice(0, 50) + '...');
    return res;
  } catch (err) {
    console.error('❌ Database query error:', err);
    throw err;
  }
};

// Test connection on startup
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result.rows[0].current_time);

    // Check if content table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'content'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✅ Table content found');

      // Get table info
      const countResult = await query('SELECT COUNT(*) FROM content');
      console.log(`📋 Found ${countResult.rows[0].count} articles in content`);
    } else {
      console.log('⚠️ Table content not found');
    }
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};