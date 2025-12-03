const { query } = require('./database');

async function addWorkflowPrefix() {
  try {
    console.log('Adding N8N_WORKFLOW_PREFIX to config_property...');

    await query(`
      INSERT INTO config_property (key, value, description, data_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key)
      DO UPDATE SET
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `, ['N8N_WORKFLOW_PREFIX', 'ContentFlowAI', 'Prefix for N8N workflow names', 'string']);

    console.log('✅ Successfully added N8N_WORKFLOW_PREFIX = ContentFlowAI');

    // Verify it was added
    const result = await query(
      'SELECT key, value, description FROM config_property WHERE key = $1',
      ['N8N_WORKFLOW_PREFIX']
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`✅ Verified: ${row.key} = "${row.value}" (${row.description})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add workflow prefix:', error.message);
    process.exit(1);
  }
}

addWorkflowPrefix();