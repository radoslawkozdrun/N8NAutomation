const { query } = require('./database');

async function checkTables() {
  try {
    console.log('Checking existing tables...');
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('Existing tables:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Check specifically for feed_fetch_log
    const feedLogCheck = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'feed_fetch_log'
    `);

    if (feedLogCheck.rows.length > 0) {
      console.log('\n✅ feed_fetch_log table exists');

      // Get row count
      const countResult = await query('SELECT COUNT(*) FROM feed_fetch_log');
      console.log(`📊 feed_fetch_log has ${countResult.rows[0].count} rows`);

      // Show sample data
      const sampleResult = await query('SELECT * FROM feed_fetch_log LIMIT 3');
      console.log('Sample data:');
      sampleResult.rows.forEach(row => {
        console.log(`- ID: ${row.id}, Fetching #: ${row.fetching_number}, Status: ${row.status}`);
      });
    } else {
      console.log('\n❌ feed_fetch_log table does not exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();