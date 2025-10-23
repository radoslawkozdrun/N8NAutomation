const { Pool } = require('pg');

const pool = new Pool({
  host: 'srv936559.hstgr.cloud',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '1qaz@WSX'
});

async function addColumns() {
  try {
    console.log('Adding status and review_justification columns to article table...');

    // Add status column
    await pool.query(`
      ALTER TABLE article
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'
    `);
    console.log('✅ Added status column');

    // Add review_justification column
    await pool.query(`
      ALTER TABLE article
      ADD COLUMN IF NOT EXISTS review_justification TEXT
    `);
    console.log('✅ Added review_justification column');

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'article'
      AND column_name IN ('status', 'review_justification')
      ORDER BY column_name
    `);

    console.log('\nVerification:');
    console.log(JSON.stringify(result.rows, null, 2));

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    pool.end();
  }
}

addColumns();
