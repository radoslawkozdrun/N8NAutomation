const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'article'
  ORDER BY ordinal_position
`)
  .then(result => {
    console.log('Article table columns:');
    console.log(JSON.stringify(result.rows, null, 2));
    pool.end();
  })
  .catch(error => {
    console.error('Error:', error);
    pool.end();
  });
