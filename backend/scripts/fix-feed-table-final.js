const { query } = require('../database');

const fixFeedTable = async () => {
  try {
    console.log('🔧 Final fix for SP_FEED table...');

    // First add URL column as nullable
    console.log('➕ Adding URL column...');
    try {
      await query('ALTER TABLE sp_feed ADD COLUMN url TEXT');
      console.log('✅ URL column added');
    } catch (error) {
      if (error.code === '42701') {
        console.log('ℹ️  URL column already exists');
      } else {
        throw error;
      }
    }

    // Populate URL from value field
    console.log('🔄 Copying data from value to url...');
    await query('UPDATE sp_feed SET url = value WHERE url IS NULL');

    // Add other missing columns
    console.log('➕ Adding other columns...');
    const addColumns = [
      { name: 'category', query: 'ALTER TABLE sp_feed ADD COLUMN category VARCHAR(100)' },
      { name: 'created_at', query: 'ALTER TABLE sp_feed ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', query: 'ALTER TABLE sp_feed ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' },
      { name: 'last_checked', query: 'ALTER TABLE sp_feed ADD COLUMN last_checked TIMESTAMP WITH TIME ZONE' },
      { name: 'error_count', query: 'ALTER TABLE sp_feed ADD COLUMN error_count INTEGER DEFAULT 0' },
      { name: 'last_error', query: 'ALTER TABLE sp_feed ADD COLUMN last_error TEXT' }
    ];

    for (const col of addColumns) {
      try {
        await query(col.query);
        console.log(`✅ ${col.name} added`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`ℹ️  ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      }
    }

    // Set category based on type
    console.log('🔄 Setting categories...');
    await query(`UPDATE sp_feed SET category = type WHERE category IS NULL AND type IS NOT NULL`);
    await query(`UPDATE sp_feed SET category = 'RSS Feed' WHERE category IS NULL`);

    // Set timestamps
    console.log('🔄 Setting timestamps...');
    await query(`UPDATE sp_feed SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
    await query(`UPDATE sp_feed SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`);
    await query(`UPDATE sp_feed SET error_count = 0 WHERE error_count IS NULL`);

    // Create indexes
    console.log('📇 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_enabled ON sp_feed(enabled)',
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_category ON sp_feed(category)',
      'CREATE INDEX IF NOT EXISTS idx_sp_feed_last_checked ON sp_feed(last_checked)'
    ];

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery);
      } catch (error) {
        console.log(`ℹ️  Index creation skipped: ${error.message}`);
      }
    }

    // Show final structure
    console.log('\n✅ Final table structure:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sp_feed'
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Show sample data
    const sampleData = await query(`
      SELECT id, name, url, enabled, category, 
             CASE WHEN created_at IS NOT NULL THEN 'Yes' ELSE 'No' END as has_created_at
      FROM sp_feed 
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('\n📊 Sample data:');
    sampleData.rows.forEach(row => {
      console.log(`   ${row.id}: ${row.name}`);
      console.log(`       URL: ${row.url}`);
      console.log(`       Status: ${row.enabled ? 'ENABLED' : 'DISABLED'}`);
      console.log(`       Category: ${row.category}`);
      console.log('');
    });

    // Statistics
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_count,
        COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_count
      FROM sp_feed
    `);

    console.log('📈 Statistics:');
    console.log(`   Total feeds: ${stats.rows[0].total}`);
    console.log(`   Enabled: ${stats.rows[0].enabled_count}`);
    console.log(`   Disabled: ${stats.rows[0].disabled_count}`);

    console.log('\n🎉 SP_FEED table is ready for feed management!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

module.exports = { fixFeedTable };

if (require.main === module) {
  fixFeedTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}