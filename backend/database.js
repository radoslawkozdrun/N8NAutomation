const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 20000, // Return error after 20 seconds if connection could not be established
  acquireTimeoutMillis: 20000, // Return error after 20 seconds if connection could not be acquired from pool
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
    
    // Check if sp_content table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'sp_content'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Table sp_content found');
      
      // Get table info
      const countResult = await query('SELECT COUNT(*) FROM sp_content');
      console.log(`📋 Found ${countResult.rows[0].count} articles in sp_content`);
    } else {
      console.log('⚠️ Table sp_content not found');
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