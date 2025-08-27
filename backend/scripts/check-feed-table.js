const { query } = require('../database');

const checkFeedTable = async () => {
  try {
    console.log('🔍 Checking SP_FEED table structure...');

    // Check if table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'sp_feed'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('⚠️  SP_FEED table not found. Creating basic structure...');
      
      // Create basic sp_feed table
      await query(`
        CREATE TABLE sp_feed (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(100),
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_checked TIMESTAMP WITH TIME ZONE,
          error_count INTEGER DEFAULT 0,
          last_error TEXT
        )
      `);

      // Create indexes
      await query(`
        CREATE INDEX IF NOT EXISTS idx_sp_feed_enabled ON sp_feed(enabled);
        CREATE INDEX IF NOT EXISTS idx_sp_feed_category ON sp_feed(category);
        CREATE INDEX IF NOT EXISTS idx_sp_feed_last_checked ON sp_feed(last_checked);
      `);

      // Insert some sample feeds
      await query(`
        INSERT INTO sp_feed (name, url, description, category) VALUES
        ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology news and startup information', 'Technology'),
        ('Hacker News', 'https://feeds.feedburner.com/ycombinator', 'Technology news aggregator', 'Technology'),
        ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'Technology news and analysis', 'Technology'),
        ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology, science, art, and culture', 'Technology')
      `);

      console.log('✅ SP_FEED table created with sample data');
    } else {
      console.log('✅ SP_FEED table found');

      // Check table structure
      const structure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'sp_feed'
        ORDER BY ordinal_position
      `);

      console.log('📋 Current table structure:');
      structure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      // Check if 'enabled' column exists
      const enabledColumn = structure.rows.find(col => col.column_name === 'enabled');
      
      if (!enabledColumn) {
        console.log('⚠️  Adding missing "enabled" column...');
        await query(`
          ALTER TABLE sp_feed 
          ADD COLUMN enabled BOOLEAN DEFAULT true
        `);
        
        await query(`
          CREATE INDEX IF NOT EXISTS idx_sp_feed_enabled ON sp_feed(enabled)
        `);
        
        console.log('✅ Added "enabled" column with default value TRUE');
      } else {
        console.log('✅ "enabled" column already exists');
      }

      // Get record count
      const countResult = await query('SELECT COUNT(*) as count FROM sp_feed');
      console.log(`📊 Found ${countResult.rows[0].count} feed sources in table`);

      // Show sample data
      if (countResult.rows[0].count > 0) {
        const sampleData = await query('SELECT id, name, url, enabled, category FROM sp_feed LIMIT 3');
        console.log('📄 Sample data:');
        sampleData.rows.forEach(feed => {
          console.log(`   ${feed.id}: ${feed.name} - ${feed.url} (${feed.enabled ? 'enabled' : 'disabled'})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking SP_FEED table:', error);
    throw error;
  }
};

module.exports = { checkFeedTable };

// Run if this file is executed directly
if (require.main === module) {
  checkFeedTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}