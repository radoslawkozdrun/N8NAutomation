const { query } = require('./database');

async function saveWebhooks() {
  try {
    console.log('💾 Saving webhook URLs to config_property...');

    // Save production webhook
    await query(`
      INSERT INTO config_property (key, value)
      VALUES ('n8n_webhook_production', 'https://n8n.srv936559.hstgr.cloud/webhook/feeds/fetch')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);

    // Save test webhook
    await query(`
      INSERT INTO config_property (key, value)
      VALUES ('n8n_webhook_test', 'https://n8n.srv936559.hstgr.cloud/webhook-test/feeds/fetch')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);

    console.log('✅ Both webhook URLs saved to config_property');

    // Verify the saved webhooks
    const result = await query(`
      SELECT key, value FROM config_property
      WHERE key LIKE 'n8n_webhook_%'
      ORDER BY key
    `);

    console.log('\n📊 Webhook configuration:');
    result.rows.forEach(row => {
      console.log(`   ${row.key}: ${row.value}`);
    });

  } catch (error) {
    console.error('❌ Error saving webhooks:', error);
    throw error;
  }
}

saveWebhooks()
  .then(() => {
    console.log('\n✅ Webhooks saved successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Save failed:', error.message);
    process.exit(1);
  });