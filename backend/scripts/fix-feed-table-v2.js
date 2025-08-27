const { query } = require('../database');

const fixFeedTable = async () => {
  try {
    console.log('🔧 Fixing SP_FEED table structure (v2)...');

    // First, let's populate URL from value before making it NOT NULL
    console.log('🔄 Populating URL field from value field...');
    await query(`UPDATE sp_feed SET url = value WHERE url IS NULL`);

    // Now add the URL column properly (nullable first, then populate, then make NOT NULL)
    console.log('➕ Adding missing columns...');
    
    const addColumns = [
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS category VARCHAR(100)',
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP', 
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE',
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0',
      'ALTER TABLE sp_feed ADD COLUMN IF NOT EXISTS last_error TEXT'
    ];

    for (const alterQuery of addColumns) {
      try {
        await query(alterQuery);
        console.log(`✅ ${alterQuery.split('ADD COLUMN IF NOT EXISTS ')[1]?.split(' ')[0] || 'Column'} added`);
      } catch (error) {
        if (error.code === '42701') { // Column already exists
          console.log(`ℹ️  Column already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Set category based on type
    console.log('🔄 Setting categories based on type...');
    await query(`UPDATE sp_feed SET category = type WHERE category IS NULL AND type IS NOT NULL`);
    await query(`UPDATE sp_feed SET category = 'RSS Feed' WHERE category IS NULL`);

    // Set timestamps for existing records
    console.log('🔄 Setting timestamps for existing records...');
    await query(`UPDATE sp_feed SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
    await query(`UPDATE sp_feed SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`);

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
    const updatedData = await query('SELECT id, name, url, enabled, category, created_at FROM sp_feed LIMIT 5');
    console.log('\n📊 Updated data sample:');
    updatedData.rows.forEach(row => {
      console.log(`   ${row.id}: ${row.name}`);
      console.log(`       URL: ${row.url || 'No URL'}`);
      console.log(`       Status: ${row.enabled ? 'enabled' : 'disabled'}`);
      console.log(`       Category: ${row.category || 'None'}`);
      console.log('');
    });

    const totalCount = await query('SELECT COUNT(*) as count FROM sp_feed');
    console.log(`📈 Total feeds: ${totalCount.rows[0].count}`);
    
    const enabledCount = await query('SELECT COUNT(*) as count FROM sp_feed WHERE enabled = true');
    console.log(`✅ Enabled feeds: ${enabledCount.rows[0].count}`);

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