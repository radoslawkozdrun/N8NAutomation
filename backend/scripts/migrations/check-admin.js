const { query } = require('./database');

async function checkAdmin() {
  try {
    console.log('Checking admin user...');

    const result = await query('SELECT username, email, role FROM "user" WHERE role = $1', ['ADMIN']);

    console.log(`Found ${result.rows.length} admin users:`);
    result.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    if (result.rows.length === 0) {
      console.log('\n⚠️  No admin user found. Let me check all users:');
      const allUsers = await query('SELECT username, email, role FROM "user" ORDER BY username');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();