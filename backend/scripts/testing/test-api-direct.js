const { query } = require('./database');

async function testDirectAPI() {
  try {
    console.log('Testing the actual API endpoint query...');

    const page = 1, limit = 20, status = '', search = '';
    const offset = (page - 1) * limit;

    let queryStr = `
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
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Add status filter (map frontend status to database status)
    if (status && status !== 'all') {
      let dbStatus = status;
      if (status === 'completed') dbStatus = 'SUCCESS';
      else if (status === 'failed') dbStatus = 'FAILED';
      else if (status === 'pending') dbStatus = 'RUNNING';

      conditions.push(`status = $${paramIndex}`);
      params.push(dbStatus);
      paramIndex++;
    }

    // Add search filter (search in fetching_number or id)
    if (search) {
      conditions.push(`(id::text LIKE $${paramIndex} OR fetching_number::text LIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryStr += ` ORDER BY started_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    console.log('Final Query:', queryStr);
    console.log('Params:', params);

    // Execute query
    const result = await query(queryStr, params);

    console.log('\n=== SUCCESSFUL QUERY RESULT ===');
    console.log('Rows returned:', result.rows.length);

    // Test pagination count
    let countQuery = 'SELECT COUNT(*) FROM feed_fetch_log';
    const countParams = [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    console.log('Total rows:', total);
    console.log('Total pages:', totalPages);

    console.log('\n=== API RESPONSE FORMAT ===');
    const apiResponse = {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: totalPages
      }
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error in API test:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDirectAPI();