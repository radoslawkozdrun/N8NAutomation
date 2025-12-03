const { query } = require('./database');

async function createMasterContentTable() {
  try {
    console.log('🔄 Creating master_content table...');

    // First, create the table
    const createTableSQL = `
      CREATE TABLE master_content (
          id SERIAL PRIMARY KEY,
          article_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content_body TEXT NOT NULL,
          status VARCHAR(30) NOT NULL,
          summary TEXT NOT NULL,
          notes TEXT NOT NULL,
          keypoints JSON NULL,
          published_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          created_by VARCHAR(100) DEFAULT NULL
      )
    `;

    await query(createTableSQL);
    console.log('✅ Table master_content created successfully');

    // Add indexes
    console.log('🔄 Adding indexes...');

    await query('CREATE INDEX idx_master_content_article_id ON master_content(article_id)');
    console.log('✅ Index on article_id created');

    await query('CREATE INDEX idx_master_content_status ON master_content(status)');
    console.log('✅ Index on status created');

    await query('CREATE INDEX idx_master_content_created_at ON master_content(created_at)');
    console.log('✅ Index on created_at created');

    // Add comments
    console.log('🔄 Adding table comments...');

    await query("COMMENT ON TABLE master_content IS 'Master content table for storing processed article content'");
    await query("COMMENT ON COLUMN master_content.article_id IS 'Reference to the original article'");
    await query("COMMENT ON COLUMN master_content.status IS 'Status of the content (draft, review, published, etc.)'");
    await query("COMMENT ON COLUMN master_content.keypoints IS 'JSON array of key points extracted from content'");
    await query("COMMENT ON COLUMN master_content.created_by IS 'Username of the person who created this content'");

    console.log('✅ Comments added successfully');

    console.log('🎉 master_content table setup completed!');

  } catch (error) {
    console.error('❌ Error creating master_content table:', error);
    throw error;
  }
}

createMasterContentTable()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  });