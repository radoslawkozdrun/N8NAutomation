const { query } = require('./database');

async function checkN8NWebhook() {
  try {
    console.log('🔍 Checking N8N webhook configuration...');

    // Check N8N configuration in database
    const n8nConfig = await query(`
      SELECT key, value, created_at, updated_at
      FROM config_property
      WHERE key LIKE 'n8n_%'
      ORDER BY key
    `);

    console.log(`\n📊 N8N Configuration (${n8nConfig.rows.length} entries):`);

    if (n8nConfig.rows.length === 0) {
      console.log('❌ No N8N configuration found in database');
    } else {
      n8nConfig.rows.forEach(config => {
        console.log(`   ${config.key}: ${config.value}`);
        console.log(`     Updated: ${config.updated_at || config.created_at}`);
      });
    }

    // Check if N8N API is accessible
    console.log('\n🔍 Testing N8N API connection...');

    const n8nUrl = n8nConfig.rows.find(c => c.key === 'n8n_url')?.value;
    const n8nApiKey = n8nConfig.rows.find(c => c.key === 'n8n_api_key')?.value;

    if (!n8nUrl) {
      console.log('❌ N8N URL not configured');
      return;
    }

    if (!n8nApiKey) {
      console.log('❌ N8N API key not configured');
      return;
    }

    console.log(`   N8N URL: ${n8nUrl}`);
    console.log(`   API Key: ${n8nApiKey.substring(0, 10)}...`);

    // Test N8N connection
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const workflows = await response.json();
        console.log(`✅ N8N API accessible - found ${workflows.data?.length || 0} workflows`);

        // Look for RSS-related workflows
        const rssWorkflows = workflows.data?.filter(w =>
          w.name.toLowerCase().includes('rss') ||
          w.name.toLowerCase().includes('feed') ||
          w.name.toLowerCase().includes('article')
        ) || [];

        if (rssWorkflows.length > 0) {
          console.log(`\n📊 RSS-related workflows found (${rssWorkflows.length}):`);
          rssWorkflows.forEach(wf => {
            console.log(`   - ${wf.name} (ID: ${wf.id}) - Active: ${wf.active ? '✅' : '❌'}`);
          });
        } else {
          console.log('\n❌ No RSS-related workflows found');
        }

      } else {
        console.log(`❌ N8N API error: ${response.status} ${response.statusText}`);
      }

    } catch (fetchError) {
      console.log(`❌ Failed to connect to N8N: ${fetchError.message}`);
    }

    // Check recent N8N logs
    console.log('\n🔍 Checking recent N8N execution logs...');

    const n8nLogs = await query(`
      SELECT
        workflow_id,
        execution_id,
        status,
        error_message,
        started_at,
        finished_at
      FROM n8n_log
      ORDER BY started_at DESC
      LIMIT 10
    `);

    if (n8nLogs.rows.length === 0) {
      console.log('❌ No N8N execution logs found');
    } else {
      console.log(`\nRecent N8N executions (${n8nLogs.rows.length}):`);
      n8nLogs.rows.forEach((log, index) => {
        console.log(`\n${index + 1}. Workflow: ${log.workflow_id}`);
        console.log(`   Execution: ${log.execution_id}`);
        console.log(`   Status: ${log.status}`);
        console.log(`   Started: ${log.started_at}`);
        console.log(`   Finished: ${log.finished_at || 'Still running'}`);
        if (log.error_message) {
          console.log(`   Error: ${log.error_message}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error checking N8N webhook:', error);
  }
}

checkN8NWebhook()
  .then(() => {
    console.log('\n✅ N8N webhook check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  });