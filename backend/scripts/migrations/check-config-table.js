const { query } = require('./database');

async function checkConfigTable() {
  try {
    console.log('Checking config_property table...');

    // Check if table exists
    const tableCheck = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'config_property'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('❌ config_property table does not exist');
      return;
    }

    console.log('✅ config_property table exists');

    // Check columns
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'config_property'
      ORDER BY ordinal_position
    `);

    console.log('\nColumns:');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check foreign key constraints
    const fkResult = await query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = 'config_property'
    `);

    console.log('\nForeign Key constraints:');
    fkResult.rows.forEach(fk => {
      console.log(`- ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // Check existing data
    const dataResult = await query('SELECT * FROM config_property LIMIT 5');
    console.log('\nExisting data:');
    dataResult.rows.forEach(row => {
      console.log(`- ${row.key}: ${row.value} (updated_by: ${row.updated_by})`);
    });

    // Check users table
    const usersResult = await query('SELECT id, username FROM "user" LIMIT 5');
    console.log('\nUsers:');
    usersResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkConfigTable();