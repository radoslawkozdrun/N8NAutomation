const fs = require('fs');
const path = require('path');
const { query } = require('./database');

async function runMigration(migrationFile) {
  try {
    console.log(`🔄 Running migration: ${migrationFile}`);

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📊 Executing: ${statement.substring(0, 100)}...`);
        await query(statement);
      }
    }

    console.log(`✅ Migration completed: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    throw error;
  }
}

async function main() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Usage: node run-migration.js <migration-file.sql>');
    process.exit(1);
  }

  try {
    await runMigration(migrationFile);
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

main();