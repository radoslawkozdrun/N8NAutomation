const { query } = require('../database');

const fixFeedTable = async () => {
  try {
    console.log('🔧 Fixing SP_FEED table structure...');

    // Get current structure
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sp_feed'
      ORDER BY ordinal_position
    `);

    console.log('📋 Current structure:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    // Check current data
    const currentData = await query('SELECT * FROM sp_feed LIMIT 3');
    console.log('\n📄 Sample current data:');
    currentData.rows.forEach(row => {
      console.log(`   ID: ${row.id}, Name: ${row.name}, Value: ${row.value}, Type: ${row.type}`);
    });

    // Add missing columns if they don't exist
    const columnNames = structure.rows.map(col => col.column_name);
    
    const requiredColumns = [
      { name: 'url', type: 'VARCHAR(500)', nullable: false, default: null },
      { name: 'category', type: 'VARCHAR(100)', nullable: true, default: null },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'CURRENT_TIMESTAMP' },
      { name: 'last_checked', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, default: null },
      { name: 'error_count', type: 'INTEGER', nullable: false, default: '0' },
      { name: 'last_error', type: 'TEXT', nullable: true, default: null }
    ];

    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`➕ Adding column: ${col.name}`);
        const alterQuery = `ALTER TABLE sp_feed ADD COLUMN ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''}${!col.nullable ? ' NOT NULL' : ''}`;
        await query(alterQuery);
      } else {
        console.log(`✅ Column ${col.name} already exists`);
      }
    }

    // If the table structure seems to be for configuration rather than feeds, 
    // we need to populate URL field based on existing data
    if (columnNames.includes('value') && !columnNames.includes('url')) {
      console.log('🔄 Updating URL field from value field...');
      await query(`UPDATE sp_feed SET url = value WHERE url IS NULL OR url = ''`);
    }

    // Set default category based on type if available
    if (columnNames.includes('type') && columnNames.includes('category')) {
      console.log('🔄 Setting categories based on type...');
      await query(`UPDATE sp_feed SET category = type WHERE category IS NULL`);
    }

    // Create indexes
    console.log('📇 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_enabled ON sp_feed(enabled)',
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_category ON sp_feed(category)',
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_last_checked ON sp_feed(last_checked)',
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_url ON sp_feed(url)'
    ];

    for (const indexQuery of indexes) {
      await query(indexQuery);
    }

    // Get final structure
    console.log('\n✅ Final table structure:');
    const finalStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sp_feed'
      ORDER BY ordinal_position
    `);
    
    finalStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Show updated data
    const updatedData = await query('SELECT id, name, url, enabled, category FROM sp_feed LIMIT 5');
    console.log('\n📊 Updated data:');
    updatedData.rows.forEach(row => {
      console.log(`   ${row.id}: ${row.name} - ${row.url || 'No URL'} (${row.enabled ? 'enabled' : 'disabled'})`);
    });

    console.log('\n🎉 SP_FEED table structure updated successfully!');
  } catch (error) {
    console.error('❌ Error fixing SP_FEED table:', error);
    throw error;
  }
};

module.exports = { fixFeedTable };

// Run if this file is executed directly
if (require.main === module) {
  fixFeedTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}