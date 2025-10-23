const { query } = require('./database');

async function checkStructure() {
  try {
    console.log('Checking feed_fetch_log table structure...');

    const structureResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'feed_fetch_log'
      ORDER BY ordinal_position
    `);

    console.log('Table structure:');
    structureResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    // Get all data
    const dataResult = await query('SELECT * FROM feed_fetch_log ORDER BY id DESC LIMIT 5');
    console.log('\nAll data:');
    dataResult.rows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStructure();