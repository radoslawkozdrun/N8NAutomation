const fetch = require('node-fetch');

async function testWebhooks() {
  try {
    console.log('🔍 Testing webhook URLs...');

    const urls = [
      'https://n8n.deradoslawkozdrun.pl/webhook/feeds/fetch',
      'https://n8n.deradoslawkozdrun.pl/webhook-test/feeds/fetch'
    ];

    for (const url of urls) {
      console.log(`\nTesting: ${url}`);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            test: true,
            feeds: ['https://stackoverflow.blog/feed/']
          })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}...`);

        if (response.ok) {
          console.log('✅ Webhook is working!');
        } else {
          console.log('❌ Webhook returned error status');
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWebhooks()
  .then(() => {
    console.log('\n✅ Webhook test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });