const { query } = require('./database');

async function checkMasterContentTable() {
  try {
    console.log('🔍 Checking master_content table structure...');

    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'master_content'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Table master_content does not exist');
      return;
    }

    console.log('✅ Table master_content exists');

    // Get table structure
    const columns = await query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'master_content'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Table structure:');
    console.log('Column'.padEnd(20) + 'Type'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default');
    console.log('-'.repeat(70));

    columns.rows.forEach(col => {
      console.log(
        col.column_name.padEnd(20) +
        col.data_type.padEnd(20) +
        col.is_nullable.padEnd(10) +
        (col.column_default || 'NULL')
      );
    });

    // Check indexes
    const indexes = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'master_content'
    `);

    console.log('\n🔍 Indexes:');
    indexes.rows.forEach(idx => {
      console.log(`- ${idx.indexname}`);
    });

    // Check row count
    const count = await query('SELECT COUNT(*) FROM master_content');
    console.log(`\n📊 Row count: ${count.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
}

checkMasterContentTable()
  .then(() => {
    console.log('\n✅ Table check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  });