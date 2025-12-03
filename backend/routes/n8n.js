const express = require('express');
const fetch = require('node-fetch');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../src/database');

const router = express.Router();

// Get N8N configuration from database
async function getN8NConfig() {
  try {
    const result = await query(`
      SELECT key, value
      FROM config_property
      WHERE key IN ('n8n_base_url', 'n8n_api_key')
      AND is_active = true
    `);

    const config = {};
    result.rows.forEach(row => {
      config[row.key] = row.value;
    });

    return {
      baseUrl: config.n8n_base_url || process.env.N8N_BASE_URL || 'https://n8n.srv936559.hstgr.cloud/api/v1',
      apiKey: config.n8n_api_key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOGI1M2UwNS00NjIxLTQyZTktYjk4Yi1hM2E4NDRjNzRlYmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU3MDYyOTg0fQ.iHyLCgW7-N1nHk0TJ4yE4JzzgIyr3Cdo63GivTprLUA'
    };
  } catch (error) {
    console.error('❌ Failed to get N8N config:', error.message);
    // Fallback to default values
    return {
      baseUrl: process.env.N8N_BASE_URL || 'https://n8n.srv936559.hstgr.cloud/api/v1',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOGI1M2UwNS00NjIxLTQyZTktYjk4Yi1hM2E4NDRjNzRlYmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU3MDYyOTg0fQ.iHyLCgW7-N1nHk0TJ4yE4JzzgIyr3Cdo63GivTprLUA'
    };
  }
}

// Helper function to make n8n API requests
async function n8nRequest(endpoint, options = {}) {
  const { baseUrl, apiKey } = await getN8NConfig();
  const url = `${baseUrl}${endpoint}`;

  const config = {
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `n8n API Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`n8n API Error: ${error.message}`);
  }
}

// Configuration endpoints

// Get N8N configuration
router.get('/config', authenticateToken, async (req, res) => {
  try {
    console.log('📡 Getting N8N configuration...');

    const result = await query(`
      SELECT key, value, description
      FROM config_property
      WHERE key IN ('n8n_base_url', 'n8n_api_key', 'n8n_timeout', 'n8n_retry_attempts')
      AND is_active = true
      ORDER BY key
    `);

    const config = {
      baseUrl: '',
      apiKey: '',
      timeout: '30000',
      retryAttempts: '3'
    };

    result.rows.forEach(row => {
      switch (row.key) {
        case 'n8n_base_url':
          config.baseUrl = row.value || '';
          break;
        case 'n8n_api_key':
          config.apiKey = row.value || '';
          break;
        case 'n8n_timeout':
          config.timeout = row.value || '30000';
          break;
        case 'n8n_retry_attempts':
          config.retryAttempts = row.value || '3';
          break;
      }
    });

    console.log('✅ N8N configuration retrieved');

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('❌ Failed to get N8N configuration:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update N8N configuration
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { baseUrl, apiKey, timeout, retryAttempts } = req.body;
    let userId = req.user ? req.user.id : null;

    console.log('📝 Updating N8N configuration...', {
      userId,
      userObj: req.user,
      baseUrl: baseUrl ? 'provided' : 'missing'
    });

    // Check if user exists in database if userId is provided
    if (userId) {
      const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
      console.log('👤 User check result:', userCheck.rows.length > 0 ? 'User exists' : 'User not found');
      if (userCheck.rows.length === 0) {
        console.log('❌ User ID not found in database, proceeding without updated_by');
        userId = null;
      }
    }

    // Validate required fields
    if (!baseUrl || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Base URL and API Key are required'
      });
    }

    // Update or insert configuration values
    const configUpdates = [
      { key: 'n8n_base_url', value: baseUrl, description: 'N8N base API URL' },
      { key: 'n8n_api_key', value: apiKey, description: 'N8N API authentication key' },
      { key: 'n8n_timeout', value: timeout || '30000', description: 'N8N API request timeout in milliseconds' },
      { key: 'n8n_retry_attempts', value: retryAttempts || '3', description: 'Number of retry attempts for failed N8N requests' }
    ];

    for (const config of configUpdates) {
      console.log(`📝 Updating config: ${config.key} with userId: ${userId}`);

      if (userId) {
        await query(`
          INSERT INTO config_property (key, value, description, data_type, updated_by)
          VALUES ($1, $2, $3, 'string', $4)
          ON CONFLICT (key)
          DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
        `, [config.key, config.value, config.description, userId]);
      } else {
        await query(`
          INSERT INTO config_property (key, value, description, data_type)
          VALUES ($1, $2, $3, 'string')
          ON CONFLICT (key)
          DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_at = CURRENT_TIMESTAMP
        `, [config.key, config.value, config.description]);
      }
    }

    console.log('✅ N8N configuration updated successfully');

    res.json({
      success: true,
      message: 'N8N configuration updated successfully'
    });
  } catch (error) {
    console.error('❌ Failed to update N8N configuration:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update N8N configuration'
    });
  }
});

// Test N8N connection with current configuration
router.post('/config/test', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Testing N8N connection...');

    // Try to fetch workflows as a connection test
    const workflows = await n8nRequest('/workflows');

    console.log(`✅ N8N connection test successful - found ${workflows.data.length} workflows`);

    res.json({
      success: true,
      data: {
        status: 'connected',
        workflowCount: workflows.data.length,
        timestamp: new Date().toISOString()
      },
      message: 'N8N connection test successful'
    });
  } catch (error) {
    console.error('❌ N8N connection test failed:', error.message);
    res.status(500).json({
      success: false,
      data: {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      message: 'N8N connection test failed'
    });
  }
});

// Get all workflows
router.get('/workflows', authenticateToken, async (req, res) => {
  try {
    console.log('📡 Fetching workflows from n8n...');
    const workflows = await n8nRequest('/workflows');

    console.log(`✅ Retrieved ${workflows.data.length} workflows from n8n`);

    // Get workflow prefix from config
    let workflowPrefix = '';
    try {
      const prefixResult = await query(`
        SELECT value FROM config_property
        WHERE key = 'N8N_WORKFLOW_PREFIX' AND is_active = true
      `);
      workflowPrefix = prefixResult.rows[0]?.value || '';
      console.log(`🔍 Workflow prefix: "${workflowPrefix}"`);
    } catch (prefixError) {
      console.error('⚠️ Failed to get workflow prefix:', prefixError.message);
    }

    // Filter workflows by prefix if configured
    let filteredWorkflows = workflows.data;
    if (workflowPrefix) {
      filteredWorkflows = workflows.data.filter(workflow =>
        workflow.name && workflow.name.startsWith(workflowPrefix)
      );
      console.log(`🔽 Filtered workflows: ${filteredWorkflows.length}/${workflows.data.length} (prefix: "${workflowPrefix}")`);
    }

    res.json({
      success: true,
      data: filteredWorkflows,
      meta: {
        total: workflows.data.length,
        filtered: filteredWorkflows.length,
        prefix: workflowPrefix
      },
      message: `Retrieved ${filteredWorkflows.length} workflows${workflowPrefix ? ` with prefix "${workflowPrefix}"` : ''}`
    });
  } catch (error) {
    console.error('❌ Failed to fetch n8n workflows:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get workflow by ID
router.get('/workflows/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📡 Fetching workflow ${id} from n8n...`);

    const workflow = await n8nRequest(`/workflows/${id}`);

    console.log(`✅ Retrieved workflow: ${workflow.data.name}`);

    res.json({
      success: true,
      data: workflow.data
    });
  } catch (error) {
    console.error(`❌ Failed to fetch workflow ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Execute workflow
router.post('/workflows/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const executionData = req.body || {};

    console.log(`🚀 Executing workflow ${id}...`);

    const execution = await n8nRequest(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(executionData),
    });

    console.log(`✅ Workflow execution started: ${execution.data.id}`);

    res.json({
      success: true,
      data: execution.data,
      message: 'Workflow execution started'
    });
  } catch (error) {
    console.error(`❌ Failed to execute workflow ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get workflow executions
router.get('/executions', authenticateToken, async (req, res) => {
  try {
    const { workflowId, status, limit = 20 } = req.query;
    let endpoint = '/executions';

    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log(`📡 Fetching executions from n8n: ${endpoint}`);

    const executions = await n8nRequest(endpoint);

    console.log(`✅ Retrieved ${executions.data.length} executions`);

    res.json({
      success: true,
      data: executions.data
    });
  } catch (error) {
    console.error('❌ Failed to fetch executions:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get execution details
router.get('/executions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📡 Fetching execution ${id} from n8n...`);

    const execution = await n8nRequest(`/executions/${id}`);

    console.log(`✅ Retrieved execution details for: ${id}`);

    res.json({
      success: true,
      data: execution.data
    });
  } catch (error) {
    console.error(`❌ Failed to fetch execution ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint for n8n connection
router.get('/health', authenticateToken, async (req, res) => {
  try {
    console.log('🏥 Checking n8n connection...');

    const workflows = await n8nRequest('/workflows');

    res.json({
      success: true,
      data: {
        status: 'connected',
        workflowCount: workflows.data.length,
        timestamp: new Date().toISOString()
      },
      message: 'n8n connection healthy'
    });
  } catch (error) {
    console.error('❌ n8n health check failed:', error.message);
    res.status(500).json({
      success: false,
      data: {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      message: 'n8n connection failed'
    });
  }
});

module.exports = router;
