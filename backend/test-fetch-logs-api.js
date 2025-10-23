const { query } = require('./database');

async function testAPI() {
  try {
    console.log('Testing API query...');

    // Test the exact query from the API
    const result = await query(`
      SELECT
        id,
        fetching_number,
        started_at,
        completed_at,
        status,
        total_records as total_feeds,
        total_valid_records as valid_feeds,
        total_invalid_records as invalid_feeds,
        feed_stats,
        triggered_by_user_id as user_id,
        created_at
      FROM feed_fetch_log
      ORDER BY started_at DESC
      LIMIT 5
    `);

    console.log('API Query Result:');
    console.log(JSON.stringify(result.rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testAPI();