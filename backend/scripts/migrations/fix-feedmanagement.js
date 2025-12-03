const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, '../src/components/FeedManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the handleFetchArticles function - replace the malformed function
const oldFunction = /const handleFetchArticles = async \(\) => \{[^}]*\};/s;

const newFunction = `const handleFetchArticles = async () => {
    try {
      setFetchingArticles(true);
      console.log('🚀 Triggering production webhook...');

      const response = await api.post('/api/webhook/fetch-feeds', {
        webhookType: 'production'
      });

      if (response.success) {
        toast.success(\`Production webhook triggered! Processed \${response.feedsProcessed} feeds.\`);
        console.log('✅ Webhook response:', response);

        // Refresh feed list after successful webhook
        setTimeout(() => {
          fetchFeeds();
        }, 2000);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Production webhook failed:', error);
      toast.error(\`Failed to trigger production webhook: \${error.message}\`);
    } finally {
      setFetchingArticles(false);
    }
  };`;

content = content.replace(oldFunction, newFunction);

// Write the fixed content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed handleFetchArticles function formatting');

// Add handleFetchTest function after handleFetchArticles
const handleFetchTestFunction = `
  const handleFetchTest = async () => {
    try {
      setFetchingTest(true);
      console.log('🚀 Triggering test webhook...');

      const response = await api.post('/api/webhook/fetch-feeds', {
        webhookType: 'test'
      });

      if (response.success) {
        toast.success(\`Test webhook triggered! Processed \${response.feedsProcessed} feeds.\`);
        console.log('✅ Test webhook response:', response);

        // Refresh feed list after successful webhook
        setTimeout(() => {
          fetchFeeds();
        }, 2000);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Test webhook failed:', error);
      toast.error(\`Failed to trigger test webhook: \${error.message}\`);
    } finally {
      setFetchingTest(false);
    }
  };`;

// Insert the test function after handleFetchArticles
content = content.replace(
  /  };(\s*\/\/ Webhook trigger functions)/,
  `  };${handleFetchTestFunction}$1`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Added handleFetchTest function');