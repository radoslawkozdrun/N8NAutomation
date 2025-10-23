const express = require('express');
const { query } = require('../database');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Trigger N8N webhook for RSS feed fetching
router.post('/fetch-feeds', authenticateToken, async (req, res) => {
  try {
    const { webhookType = 'production' } = req.body;
    console.log(`📡 Triggering ${webhookType} webhook for RSS feed fetching...`);

    // Get webhook URL from config
    const configKey = webhookType === 'test' ? 'n8n_webhook_test' : 'n8n_webhook_production';
    const configResult = await query(
      'SELECT value FROM config_property WHERE key = $1',
      [configKey]
    );

    if (configResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Webhook URL not configured for type: ${webhookType}`
      });
    }

    const webhookUrl = configResult.rows[0].value;
    console.log(`🔗 Using webhook: ${webhookUrl}`);

    // Get active feeds
    const feedsResult = await query(
      'SELECT id, url, name FROM feed WHERE enabled = true ORDER BY id'
    );

    const activeFeeds = feedsResult.rows;
    console.log(`📊 Found ${activeFeeds.length} active feeds`);

    if (activeFeeds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active feeds to process',
        feedsProcessed: 0
      });
    }

    // Generate unique fetch ID
    const fetch_id = crypto.randomUUID ? crypto.randomUUID() : `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare webhook payload in format expected by N8N (same as /feeds/fetch-articles)
    const webhookPayload = {
      fetchType: 'ALL',  // We're fetching all active feeds
      fetch_id,
      user_id: req.user?.id || null,  // Use authenticated user ID
      timestamp: new Date().toISOString(),
      source: 'FlowCraft-RSS-Manager'
    };

    // Call N8N webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowCraft-RSS-Manager/1.0'
      },
      body: JSON.stringify(webhookPayload),
      timeout: 30000
    });

    const responseText = await webhookResponse.text();

    if (webhookResponse.ok) {
      console.log(`✅ Webhook triggered successfully: ${responseText}`);

      res.json({
        success: true,
        message: `${webhookType} webhook triggered successfully`,
        feedsProcessed: activeFeeds.length,
        webhookResponse: responseText,
        webhookUrl: webhookUrl
      });
    } else {
      console.error(`❌ Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
      console.error(`Response: ${responseText}`);

      res.status(500).json({
        success: false,
        error: `Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`,
        details: responseText
      });
    }

  } catch (error) {
    console.error('❌ Error triggering webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger webhook',
      details: error.message
    });
  }
});

// Get webhook status and configuration
router.get('/status', async (req, res) => {
  try {
    // Get webhook URLs
    const webhookConfig = await query(`
      SELECT key, value FROM config_property
      WHERE key IN ('n8n_webhook_production', 'n8n_webhook_test')
      ORDER BY key
    `);

    // Get active feeds count
    const feedsCount = await query('SELECT COUNT(*) FROM feed WHERE enabled = true');

    // Get recent fetch logs
    const recentLogs = await query(`
      SELECT * FROM feed_fetch_log
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      webhooks: webhookConfig.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {}),
      activeFeedsCount: parseInt(feedsCount.rows[0].count),
      recentFetchLogs: recentLogs.rows
    });

  } catch (error) {
    console.error('❌ Error getting webhook status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook status',
      details: error.message
    });
  }
});

module.exports = router;