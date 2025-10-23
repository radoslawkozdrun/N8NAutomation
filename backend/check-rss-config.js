const { query } = require('./database');

async function checkRSSConfig() {
  try {
    console.log('🔍 Checking RSS feeds configuration...');

    // Check if RSS feeds table exists and has data
    const feeds = await query(`
      SELECT
        id,
        url,
        title,
        is_active,
        fetch_interval_minutes,
        last_fetch,
        webhook_url,
        created_at
      FROM rss_feeds
      ORDER BY created_at DESC
    `);

    console.log(`\n📊 Found ${feeds.rows.length} RSS feeds:`);

    if (feeds.rows.length === 0) {
      console.log('❌ No RSS feeds configured in database');
      return;
    }

    feeds.rows.forEach((feed, index) => {
      console.log(`\n${index + 1}. ${feed.title || 'Unnamed Feed'}`);
      console.log(`   URL: ${feed.url}`);
      console.log(`   Active: ${feed.is_active ? '✅' : '❌'}`);
      console.log(`   Interval: ${feed.fetch_interval_minutes} minutes`);
      console.log(`   Last fetch: ${feed.last_fetch || 'Never'}`);
      console.log(`   Webhook: ${feed.webhook_url || 'Not configured'}`);
    });

    // Check N8N configuration
    console.log('\n🔍 Checking N8N configuration...');

    const n8nConfig = await query(`
      SELECT key, value
      FROM config_property
      WHERE key LIKE 'n8n_%'
      ORDER BY key
    `);

    if (n8nConfig.rows.length === 0) {
      console.log('❌ No N8N configuration found');
    } else {
      console.log('\nN8N Configuration:');
      n8nConfig.rows.forEach(config => {
        console.log(`   ${config.key}: ${config.value}`);
      });
    }

    // Check fetch logs
    console.log('\n🔍 Checking recent fetch logs...');

    const logs = await query(`
      SELECT
        feed_id,
        status,
        error_message,
        articles_found,
        articles_new,
        fetch_duration_ms,
        created_at
      FROM feed_fetch_log
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (logs.rows.length === 0) {
      console.log('❌ No fetch logs found - webhook might not be running');
    } else {
      console.log(`\nRecent fetch attempts (${logs.rows.length}):`);
      logs.rows.forEach((log, index) => {
        console.log(`\n${index + 1}. Feed ID: ${log.feed_id}`);
        console.log(`   Status: ${log.status}`);
        console.log(`   Articles found: ${log.articles_found || 0}`);
        console.log(`   New articles: ${log.articles_new || 0}`);
        console.log(`   Duration: ${log.fetch_duration_ms}ms`);
        console.log(`   Time: ${log.created_at}`);
        if (log.error_message) {
          console.log(`   Error: ${log.error_message}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error checking RSS configuration:', error);
  }
}

checkRSSConfig()
  .then(() => {
    console.log('\n✅ RSS configuration check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  });