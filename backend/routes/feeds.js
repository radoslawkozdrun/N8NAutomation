const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { query } = require('../src/database');
const { authenticateToken, requireAdmin, auditLog, addUserFilter, addUserConstraint, requireOwnershipOrAdmin } = require('../middleware/auth');
const config = require('../src/config');

const router = express.Router();

// Path to logs file
const LOGS_FILE_PATH = path.join(__dirname, '../logs/fetch-articles.json');

// Helper function to write log entry to file
async function writeLogToFile(logEntry) {
  try {
    // Ensure logs directory exists
    const logsDir = path.dirname(LOGS_FILE_PATH);
    try {
      await fs.access(logsDir);
    } catch (error) {
      await fs.mkdir(logsDir, { recursive: true });
      console.log('Created logs directory:', logsDir);
    }

    let logs = [];

    // Try to read existing logs
    try {
      const fileContent = await fs.readFile(LOGS_FILE_PATH, 'utf8');
      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
      }
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      logs = [];
      console.log('Starting new log file:', LOGS_FILE_PATH);
    }

    // Ensure logs is an array
    if (!Array.isArray(logs)) {
      console.warn('Log file contained invalid data, resetting to empty array');
      logs = [];
    }

    // Add new log entry with validation
    if (logEntry && typeof logEntry === 'object') {
      logs.unshift(logEntry); // Add to beginning
    } else {
      console.error('Invalid log entry provided:', logEntry);
      return;
    }

    // Keep only last 1000 entries to prevent file from growing too large
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000);
    }

    // Write back to file with error handling
    try {
      await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
      console.log('Log entry written successfully:', logEntry.id || 'unknown-id');
    } catch (writeError) {
      console.error('Error writing to log file:', writeError);
      // Try to write without formatting as fallback
      await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(logs));
    }
  } catch (error) {
    console.error('Error writing log to file:', error);
    // Log to console as fallback
    console.log('Fallback log entry:', JSON.stringify(logEntry, null, 2));
  }
}

// Get N8N configuration from database
async function getN8NConfig() {
  try {
    const result = await query(`
      SELECT key, value
      FROM config_property
      WHERE key IN ('n8n_base_url', 'n8n_api_key')
      AND is_active = true
    `);

    const dbConfig = {};
    result.rows.forEach(row => {
      dbConfig[row.key] = row.value;
    });

    return {
      baseUrl: dbConfig.n8n_base_url || config.n8n.baseUrl,
      apiKey: dbConfig.n8n_api_key || config.n8n.apiKey
    };
  } catch (error) {
    console.error('❌ Failed to get N8N config from database:', error.message);
    return {
      baseUrl: config.n8n.baseUrl,
      apiKey: config.n8n.apiKey
    };
  }
}

// Check if ContentFlowAI workflow is active
async function isContentFlowAIWorkflowActive() {
  try {
    const { baseUrl, apiKey } = await getN8NConfig();
    const response = await fetch(`${baseUrl}/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch workflows from N8N:', response.statusText);
      return false; // Default to test webhook if can't check
    }

    const data = await response.json();
    const targetWorkflow = data.data.find(workflow =>
      workflow.name === 'ContentFlowAI - N8N - 01 - RSS download'
    );

    if (!targetWorkflow) {
      console.log('ContentFlowAI workflow not found, using test webhook');
      return false;
    }

    const isActive = targetWorkflow.active === true;
    console.log(`ContentFlowAI workflow status: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
    return isActive;
  } catch (error) {
    console.error('Error checking ContentFlowAI workflow status:', error.message);
    return false; // Default to test webhook on error
  }
}

// Get all feeds with pagination and filtering
router.get('/feeds', authenticateToken, addUserFilter, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      enabled,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Add user filter first
    paramIndex = addUserConstraint(whereConditions, queryParams, req.userFilter, paramIndex);

    // Build WHERE clause
    if (type) {
      whereConditions.push(`type = $${paramIndex++}`);
      queryParams.push(type);
    }

    if (enabled !== undefined) {
      whereConditions.push(`enabled = $${paramIndex++}`);
      queryParams.push(enabled === 'true');
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex++} OR url ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      // paramIndex was already incremented 3 times in the whereConditions.push line
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM feed
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Build ORDER BY clause
    let orderBy = 'ORDER BY f.name ASC';
    if (req.query.sort_by) {
      const validSortFields = [
        'name',
        'url',
        'type',
        'enabled',
        'created_at',
        'updated_at',
        'last_checked',
        'error_count',
        'domain_name'
      ];
      const sortBy = validSortFields.includes(req.query.sort_by) ? req.query.sort_by : 'name';
      const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';

      if (sortBy === 'domain_name') {
        orderBy = `ORDER BY d.domain_name ${sortOrder} NULLS LAST`;
      } else if (sortBy === 'enabled') {
        // Custom boolean sorting (enabled first when DESC)
        orderBy = `ORDER BY f.enabled ${sortOrder}`;
      } else {
        orderBy = `ORDER BY f.${sortBy} ${sortOrder} NULLS LAST`;
      }
    }

    // Get feeds with pagination
    queryParams.push(limit, offset);
    const feedsQuery = `
      SELECT 
        f.id, f.name, f.url, f.description, f.type, f.enabled,
        f.created_at, f.updated_at, f.last_checked, f.error_count, f.last_error,
        f.domain_id, d.domain_name, d.domain_id as domain_code
      FROM feed f
      LEFT JOIN domain d ON f.domain_id = d.id
      ${whereClause.replace('FROM feed', 'FROM feed f')}
      ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const feedsResult = await query(feedsQuery, queryParams);

    res.json({
      success: true,
      data: feedsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting feeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feeds'
    });
  }
});

// Get fetch articles logs from file (must be before /feeds/:id route)
// Get feed fetch logs from database
router.get('/feeds/fetch-logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = `
      SELECT
        id,
        fetching_number,
        fetched_at as started_at,
        updated_at as completed_at,
        status,
        total_records as total_feeds,
        valid_records as valid_feeds,
        invalid_records as invalid_feeds,
        '{}' as feed_stats,
        user_id,
        created_at
      FROM feed_fetch_log
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Add status filter (map frontend status to database status)
    if (status && status !== 'all') {
      let dbStatus = status;
      if (status === 'completed') dbStatus = 'SUCCESS';
      else if (status === 'failed') dbStatus = 'FAILED';
      else if (status === 'pending') dbStatus = 'RUNNING';

      conditions.push(`status = $${paramIndex}`);
      params.push(dbStatus);
      paramIndex++;
    }

    // Add search filter (search in fetching_number or id)
    if (search) {
      conditions.push(`(id::text LIKE $${paramIndex} OR fetching_number::text LIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryStr += ` ORDER BY fetched_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await query(queryStr, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM feed_fetch_log';
    const countParams = [];
    let countParamIndex = 1;

    if (conditions.length > 0) {
      // Rebuild conditions for count query
      const countConditions = [];
      if (status && status !== 'all') {
        let dbStatus = status;
        if (status === 'completed') dbStatus = 'SUCCESS';
        else if (status === 'failed') dbStatus = 'FAILED';
        else if (status === 'pending') dbStatus = 'RUNNING';

        countConditions.push(`status = $${countParamIndex}`);
        countParams.push(dbStatus);
        countParamIndex++;
      }
      if (search) {
        countConditions.push(`(id::text LIKE $${countParamIndex} OR fetching_number::text LIKE $${countParamIndex})`);
        countParams.push(`%${search}%`);
        countParamIndex++;
      }
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error reading logs from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error.message
    });
  }
});

// Get single feed by ID
router.get('/feeds/:id', authenticateToken, requireOwnershipOrAdmin('feed'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        f.id, f.name, f.url, f.description, f.type, f.enabled,
        f.created_at, f.updated_at, f.last_checked, f.error_count, f.last_error,
        f.domain_id, d.domain_name, d.domain_id as domain_code
      FROM feed f
      LEFT JOIN domain d ON f.domain_id = d.id
      WHERE f.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feed'
    });
  }
});

// Create new feed (admin only)
router.post('/feeds', authenticateToken, requireAdmin, auditLog('CREATE_FEED', 'feed'), async (req, res) => {
  try {
    const { name, url, description, type, enabled = true, domain_id } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required'
      });
    }

    if (!domain_id) {
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    // Check if URL already exists
    const existingFeed = await query('SELECT id FROM feed WHERE url = $1', [url]);
    if (existingFeed.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Feed with this URL already exists'
      });
    }

    // Insert new feed with user_id and domain_id
    const result = await query(`
      INSERT INTO feed (name, url, description, type, enabled, value, user_id, domain_id)
      VALUES ($1, $2, $3, $4, $5, $2, $6, $7)
      RETURNING id, name, url, description, type, enabled, created_at, updated_at, domain_id
    `, [name, url, description, type, enabled, req.user.id, domain_id]);

    // Get domain info for the response
    const feedWithDomain = await query(`
      SELECT 
        f.id, f.name, f.url, f.description, f.type, f.enabled,
        f.created_at, f.updated_at, f.domain_id, d.domain_name, d.domain_id as domain_code
      FROM feed f
      LEFT JOIN domain d ON f.domain_id = d.id
      WHERE f.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      message: 'Feed created successfully',
      data: feedWithDomain.rows[0]
    });
  } catch (error) {
    console.error('Error creating feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feed'
    });
  }
});

// Update feed
router.put('/feeds/:id', authenticateToken, requireOwnershipOrAdmin('feed'), auditLog('UPDATE_FEED', 'feed'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, description, type, enabled, domain_id } = req.body;

    // Check if feed exists
    const existingFeed = await query('SELECT id, url FROM feed WHERE id = $1', [id]);
    if (existingFeed.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    // If URL is being changed, check for duplicates
    if (url && url !== existingFeed.rows[0].url) {
      const duplicateCheck = await query('SELECT id FROM feed WHERE url = $1 AND id != $2', [url, id]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Feed with this URL already exists'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      updates.push(`value = $${paramIndex++}`);
      values.push(url, url);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (enabled !== undefined) {
      updates.push(`enabled = $${paramIndex++}`);
      values.push(enabled);
    }
    if (domain_id !== undefined) {
      updates.push(`domain_id = $${paramIndex++}`);
      values.push(domain_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE feed 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, url, description, type, enabled,
        created_at, updated_at, last_checked, error_count, domain_id
    `;

    const result = await query(updateQuery, values);

    // Get updated feed with domain info
    const feedWithDomain = await query(`
      SELECT 
        f.id, f.name, f.url, f.description, f.type, f.enabled,
        f.created_at, f.updated_at, f.last_checked, f.error_count,
        f.domain_id, d.domain_name, d.domain_id as domain_code
      FROM feed f
      LEFT JOIN domain d ON f.domain_id = d.id
      WHERE f.id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Feed updated successfully',
      data: feedWithDomain.rows[0]
    });
  } catch (error) {
    console.error('Error updating feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feed'
    });
  }
});

// Toggle feed enabled status
router.patch('/feeds/:id/toggle', authenticateToken, requireOwnershipOrAdmin('feed'), auditLog('TOGGLE_FEED', 'feed'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE feed 
      SET enabled = NOT enabled, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id, name, url, enabled, updated_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    const feed = result.rows[0];
    res.json({
      success: true,
      message: `Feed ${feed.enabled ? 'enabled' : 'disabled'} successfully`,
      data: feed
    });
  } catch (error) {
    console.error('Error toggling feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle feed status'
    });
  }
});

// Clear fetch articles logs (must be before /feeds/:id route)
router.delete('/feeds/fetch-logs', authenticateToken, async (req, res) => {
  try {
    // Clear the log file by writing an empty array
    await fs.writeFile(LOGS_FILE_PATH, '[]');

    res.json({
      success: true,
      message: 'Fetch logs cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing logs file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear logs',
      error: error.message
    });
  }
});

// Delete feed (admin or owner only)
router.delete('/feeds/:id', authenticateToken, requireOwnershipOrAdmin('feed'), auditLog('DELETE_FEED', 'feed'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM feed 
      WHERE id = $1
      RETURNING name, url
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    res.json({
      success: true,
      message: `Feed "${result.rows[0].name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feed'
    });
  }
});

// Get feed categories
router.get('/feeds/meta/types', authenticateToken, addUserFilter, async (req, res) => {
  try {
    // Build WHERE clause with user filter
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    paramIndex = addUserConstraint(conditions, params, req.userFilter, paramIndex);
    conditions.push('type IS NOT NULL');

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await query(`
      SELECT DISTINCT type
      FROM feed 
      ${whereClause}
      ORDER BY type
    `, params);

    res.json({
      success: true,
      data: result.rows.map(row => row.type)
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
});

// Get feed statistics
router.get('/feeds/meta/stats', authenticateToken, addUserFilter, async (req, res) => {
  try {
    // Build WHERE clauses with user filter
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    paramIndex = addUserConstraint(conditions, params, req.userFilter, paramIndex);
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Category stats need additional WHERE clause for NOT NULL
    const typeConditions = [...conditions, 'type IS NOT NULL'];
    const typeWhereClause = typeConditions.length > 0 ? 'WHERE ' + typeConditions.join(' AND ') : '';

    const statsQuery = `
      SELECT 
        COUNT(*) as total_feeds,
        COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_feeds,
        COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_feeds,
        COUNT(CASE WHEN last_checked IS NOT NULL THEN 1 END) as checked_feeds,
        COUNT(CASE WHEN error_count > 0 THEN 1 END) as error_feeds,
        AVG(error_count) as avg_error_count
      FROM feed
      ${whereClause}
    `;

    const typeStatsQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_count
      FROM feed 
      ${typeWhereClause}
      GROUP BY type
      ORDER BY count DESC
    `;

    const [statsResult, typeResult] = await Promise.all([
      query(statsQuery, params),
      query(typeStatsQuery, params)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          ...statsResult.rows[0],
          avg_error_count: parseFloat(statsResult.rows[0].avg_error_count) || 0
        },
        types: typeResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting feed stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feed statistics'
    });
  }
});

// Test feed URL (check if it's accessible)
router.post('/feeds/test-url', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Simple URL validation
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Basic URL accessibility test (you might want to implement actual RSS validation)
    const urlPattern = /^https?:\/\/.+/i;
    const isValidUrl = urlPattern.test(url);

    res.json({
      success: true,
      data: {
        url,
        valid: isValidUrl,
        message: isValidUrl ? 'URL format is valid' : 'URL format is invalid',
        tested_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error testing URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test URL'
    });
  }
});

// Proxy endpoint for N8N webhook to avoid CORS issues
router.post('/feeds/fetch-articles', authenticateToken, async (req, res) => {
  try {
    const { fetchType, ids = [] } = req.body;

    // Validate input
    if (!fetchType || !['SELECTED', 'ALL'].includes(fetchType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fetchType. Must be SELECTED or ALL'
      });
    }

    if (fetchType === 'SELECTED' && (!ids || ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'ids array is required when fetchType is SELECTED'
      });
    }

    // Create log entry
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      user: req.user?.username || 'Unknown',
      fetchType,
      ids: fetchType === 'SELECTED' ? ids : 'ALL',
      status: 'starting',
      message: 'Initiating fetch request to N8N webhook...'
    };

    // Log the request for auditing
    console.log('Proxying feed fetch request:', logEntry);

    // Generate unique fetch ID (fallback if crypto.randomUUID is not available)
    const fetch_id = crypto.randomUUID ? crypto.randomUUID() : `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare payload for N8N webhook
    const payload = {
      fetchType,
      fetch_id,
      user_id: req.user?.id || null,
      ...(fetchType === 'SELECTED' && { ids })
    };

    // Log the payload being sent to webhook
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Check ContentFlowAI workflow status and determine webhook URL
    const isWorkflowActive = await isContentFlowAIWorkflowActive();
    const webhookPath = isWorkflowActive ? '/webhook/feeds/fetch' : '/webhook-test/feeds/fetch';
    const webhookUrl = `${config.n8n.webhookBase}${webhookPath}`;

    console.log(`Using webhook: ${webhookUrl} (ContentFlowAI workflow is ${isWorkflowActive ? 'ACTIVE' : 'INACTIVE'})`);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => ({}));

    // Update log entry with result
    const finalLogEntry = {
      ...logEntry,
      status: response.ok ? 'success' : 'error',
      httpStatus: `${response.status} ${response.statusText}`,
      message: response.ok ? 'Article fetch request sent successfully' : `N8N webhook error: ${response.statusText}`,
      responseData: responseData,
      webhookPayload: payload
    };

    // Write log to file
    await writeLogToFile(finalLogEntry);

    // Return the response from N8N webhook along with the payload we sent
    res.status(response.status).json({
      success: response.ok,
      data: responseData,
      webhookPayload: payload,
      httpStatus: `${response.status} ${response.statusText}`,
      message: response.ok ? 'Article fetch request sent successfully' : `N8N webhook error: ${response.statusText}`
    });

  } catch (error) {
    console.error('Error proxying fetch request:', error);

    // Handle different types of errors
    let errorMessage = 'Failed to send fetch request to N8N webhook';
    let statusCode = 500;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to connect to N8N webhook';
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Timeout: N8N webhook did not respond in time';
      statusCode = 504; // Gateway Timeout
    }

    // Log error to file
    const errorLogEntry = {
      ...logEntry,
      status: 'error',
      httpStatus: `${statusCode} ${statusCode === 503 ? 'Service Unavailable' : statusCode === 504 ? 'Gateway Timeout' : 'Internal Server Error'}`,
      message: errorMessage,
      error: error.message,
      webhookPayload: {
        fetchType,
        fetch_id: fetch_id || 'unknown',
        user_id: req.user?.id || null,
        ...(fetchType === 'SELECTED' && { ids })
      }
    };

    await writeLogToFile(errorLogEntry);

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      webhookPayload: {
        fetchType,
        fetch_id: fetch_id || 'unknown',
        user_id: req.user?.id || null,
        ...(fetchType === 'SELECTED' && { ids })
      },
      httpStatus: `${statusCode} ${statusCode === 503 ? 'Service Unavailable' : statusCode === 504 ? 'Gateway Timeout' : 'Internal Server Error'}`
    });
  }
});

module.exports = router;
