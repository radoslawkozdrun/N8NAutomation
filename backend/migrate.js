const fs = require('fs');
const path = require('path');
const { query } = require('./database');

const runMigrations = async () => {
  console.log('🔄 Starting migration process...');
  
  const migrationsPath = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically to ensure proper order

  for (const file of migrationFiles) {
    console.log(`📜 Running migration: ${file}`);
    
    try {
      const migrationSQL = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
      await query(migrationSQL);
      console.log(`✅ Migration completed: ${file}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⏭️  Migration skipped (already exists): ${file}`);
      } else {
        console.error(`❌ Migration failed: ${file}`, error.message);
        throw error;
      }
    }
  }
  
  console.log('🎉 All migrations completed successfully');
  process.exit(0);
};

runMigrations().catch(error => {
  console.error('❌ Migration process failed:', error);
  process.exit(1);
});