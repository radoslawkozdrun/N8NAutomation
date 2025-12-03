const { query } = require('./database');
const { authenticateToken } = require('./middleware/auth');
const express = require('express');

async function testDomainEndpointLogic() {
  try {
    console.log('Testing domain endpoint logic directly...');

    // Simulate the exact logic from domains.js
    const req = {
      query: {
        page: 1,
        limit: 20
      }
    };

    const { page = 1, limit = 20, active, search } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    console.log('Parameters:', { page, limit, active, search, offset });

    // Build WHERE clause
    if (active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      queryParams.push(active === 'true');
    }

    if (search) {
      whereConditions.push(`(domain_name ILIKE $${paramIndex++} OR domain_id ILIKE $${paramIndex++})`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
      paramIndex += 1; // We added 2 more params but incremented by 1 already
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    console.log('WHERE clause:', whereClause);
    console.log('Query params:', queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM domain
      ${whereClause}
    `;

    console.log('\n🔍 Running count query...');
    console.log('Query:', countQuery.replace(/\s+/g, ' ').trim());

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    console.log(`Total count: ${total}`);

    // Get domains with pagination
    queryParams.push(limit, offset);
    const domainsQuery = `
      SELECT
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
      FROM domain
      ${whereClause}
      ORDER BY domain_name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    console.log('\n🔍 Running domains query...');
    console.log('Query:', domainsQuery.replace(/\s+/g, ' ').trim());
    console.log('Final params:', queryParams);

    const domainsResult = await query(domainsQuery, queryParams);

    console.log(`\n✅ Success! Got ${domainsResult.rows.length} domains`);

    if (domainsResult.rows.length > 0) {
      console.log('Sample domain:', domainsResult.rows[0]);
    }

    const response = {
      success: true,
      data: domainsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };

    console.log('\n📄 Final response structure:');
    console.log('Success:', response.success);
    console.log('Data count:', response.data.length);
    console.log('Pagination:', response.pagination);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in endpoint logic:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testDomainEndpointLogic();