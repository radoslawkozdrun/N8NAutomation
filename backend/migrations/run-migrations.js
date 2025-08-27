const fs = require('fs');
const path = require('path');
const { query } = require('../database');

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = __dirname;
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const executedMigrations = await query('SELECT filename FROM migrations');
    const executedSet = new Set(executedMigrations.rows.map(row => row.filename));

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (!executedSet.has(filename)) {
        console.log(`📄 Executing migration: ${filename}`);
        
        const filePath = path.join(migrationsDir, filename);
        const migrationSQL = fs.readFileSync(filePath, 'utf8');
        
        // Execute migration
        await query(migrationSQL);
        
        // Record migration as executed
        await query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        console.log(`✅ Migration completed: ${filename}`);
      } else {
        console.log(`⏭️  Migration already executed: ${filename}`);
      }
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

module.exports = { runMigrations };

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}