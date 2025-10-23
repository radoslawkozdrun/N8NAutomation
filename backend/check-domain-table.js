const { query } = require('./database');

async function checkDomainTable() {
  try {
    console.log('Checking if domain table exists...');

    // Check if domain table exists
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'domain'
    `);

    if (result.rows.length === 0) {
      console.log('❌ Domain table does NOT exist');

      // Check all tables
      const allTables = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      console.log('\n📋 All existing tables:');
      allTables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });

    } else {
      console.log('✅ Domain table exists');

      // Check table structure
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'domain'
        ORDER BY ordinal_position
      `);

      console.log('\n📊 Domain table structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDomainTable();