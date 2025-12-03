const { query } = require('./database');

async function testDomainQuery() {
  try {
    console.log('Testing domain query...');

    // Simple count query first
    console.log('\n🔍 Counting domains...');
    const countResult = await query('SELECT COUNT(*) as total FROM domain');
    console.log(`Total domains: ${countResult.rows[0].total}`);

    // Test the exact query from the API
    console.log('\n🔍 Testing full query...');
    const testQuery = `
      SELECT
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
      FROM domain
      ORDER BY domain_name ASC
      LIMIT 20 OFFSET 0
    `;

    const result = await query(testQuery);
    console.log(`Query returned ${result.rows.length} rows`);

    if (result.rows.length > 0) {
      console.log('\n📋 Sample data:');
      result.rows.slice(0, 3).forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.domain_name} (${row.domain_id}) - Active: ${row.is_active}`);
      });
    } else {
      console.log('⚠️  No domain data found');

      // Let's try to create a sample domain
      console.log('\n🔧 Creating sample domain...');
      const insertResult = await query(`
        INSERT INTO domain (domain_id, domain_name, config, is_active, created_by, updated_by)
        VALUES ('example.com', 'Example Domain', '{}', true, 'system', 'system')
        RETURNING id, domain_name
      `);

      console.log(`✅ Created sample domain: ${insertResult.rows[0].domain_name} (ID: ${insertResult.rows[0].id})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDomainQuery();