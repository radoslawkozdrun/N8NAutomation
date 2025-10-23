const { Pool } = require('pg');

const pool = new Pool({
  host: 'srv936559.hstgr.cloud',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '1qaz@WSX'
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
