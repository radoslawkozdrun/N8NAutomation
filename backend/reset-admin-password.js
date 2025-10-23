const bcrypt = require('bcryptjs');
const { query } = require('./database');

async function resetAdminPassword() {
  try {
    const newPassword = '1qaz@WSX';

    console.log('Resetting admin password...');
    console.log('New password:', newPassword);

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update admin password
    const result = await query(`
      UPDATE "user"
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE username = 'admin' AND role = 'ADMIN'
      RETURNING id, username, email, role
    `, [passwordHash]);

    if (result.rows.length === 0) {
      console.log('Admin user not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('Password reset successfully for user:', user);
    console.log('You can now login with: admin / 1qaz@WSX');

  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();