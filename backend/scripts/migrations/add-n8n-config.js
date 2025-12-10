const { query } = require('./database');

async function addN8NConfig() {
  try {
    const configs = [
      {
        key: 'n8n_base_url',
        value: 'https://n8n.deradoslawkozdrun.pl/api/v1',
        description: 'N8N base API URL'
      },
      {
        key: 'n8n_api_key',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOGI1M2UwNS00NjIxLTQyZTktYjk4Yi1hM2E4NDRjNzRlYmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU3MDYyOTg0fQ.iHyLCgW7-N1nHk0TJ4yE4JzzgIyr3Cdo63GivTprLUA',
        description: 'N8N API authentication key'
      },
      {
        key: 'n8n_timeout',
        value: '30000',
        description: 'N8N API request timeout in milliseconds'
      },
      {
        key: 'n8n_retry_attempts',
        value: '3',
        description: 'Number of retry attempts for failed N8N requests'
      }
    ];

    for (const config of configs) {
      await query(`
        INSERT INTO config_property (key, value, description, data_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO NOTHING
      `, [config.key, config.value, config.description, 'string']);
    }

    console.log('✅ N8N configuration defaults added successfully');

    // Verify the configuration was added
    const result = await query(`
      SELECT key, value, description
      FROM config_property
      WHERE key LIKE 'n8n_%'
      ORDER BY key
    `);

    console.log('📋 N8N Configuration values:');
    result.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add N8N configuration:', error.message);
    process.exit(1);
  }
}

addN8NConfig();