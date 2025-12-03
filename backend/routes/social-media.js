const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../src/database');

const router = express.Router();

// Get all social media accounts with filters and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      platform,
      status,
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    if (platform && platform !== 'all') {
      paramCount++;
      whereConditions.push(`platform = $${paramCount}`);
      queryParams.push(platform);
    }

    if (status && status !== 'all') {
      paramCount++;
      whereConditions.push(`status = $${paramCount}`);
      queryParams.push(status);
    }

    if (search.trim()) {
      paramCount++;
      whereConditions.push(`(display_name ILIKE $${paramCount} OR username ILIKE $${paramCount})`);
      queryParams.push(`%${search.trim()}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM social_media_account
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated accounts
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const accountsQuery = `
      SELECT
        id,
        platform,
        username,
        display_name,
        status,
        followers,
        connection_health,
        posting_enabled,
        api_rate_limit_used,
        api_rate_limit_total,
        api_rate_limit_reset_time,
        last_sync,
        error_message,
        warning_message,
        created_at,
        updated_at
      FROM social_media_account
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    console.log('📄 Fetching social media accounts with filters:', { page, limit, platform, status, search });

    const accountsResult = await query(accountsQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: accountsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

    console.log(`✅ Found ${accountsResult.rows.length} social media accounts (${total} total)`);

  } catch (error) {
    console.error('❌ Failed to fetch social media accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media accounts',
      error: error.message
    });
  }
});

// Get social media accounts by platform
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Mock social media accounts for demo
    const mockSocialAccounts = {
      TWITTER: [
        {
          id: 1,
          platform: 'TWITTER',
          username: 'techcompany_pl',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        },
        {
          id: 2,
          platform: 'TWITTER',
          username: 'ceo_techcompany',
          display_name: 'CEO Tech Company',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      LINKEDIN: [
        {
          id: 3,
          platform: 'LINKEDIN',
          username: 'tech-company-poland',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      FACEBOOK: [
        {
          id: 4,
          platform: 'FACEBOOK',
          username: 'techcompanypoland',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      INSTAGRAM: [],
      TIKTOK: []
    };
    
    const accounts = mockSocialAccounts[platform.toUpperCase()] || [];

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media accounts',
      code: 'FETCH_ERROR'
    });
  }
});

// Get single account by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const accountQuery = `
      SELECT
        id,
        platform,
        username,
        display_name,
        status,
        followers,
        connection_health,
        posting_enabled,
        api_rate_limit_used,
        api_rate_limit_total,
        api_rate_limit_reset_time,
        last_sync,
        error_message,
        warning_message,
        created_at,
        updated_at
      FROM social_media_account
      WHERE id = $1
    `;

    const result = await query(accountQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Failed to fetch social media account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media account',
      error: error.message
    });
  }
});

// Create new social media account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      platform,
      username,
      display_name,
      status = 'disconnected',
      followers = 0,
      connection_health = 'unknown',
      posting_enabled = false
    } = req.body;

    const { userId } = req.user;

    const insertQuery = `
      INSERT INTO social_media_account (
        platform, username, display_name, status, followers,
        connection_health, posting_enabled, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      platform, username, display_name, status, followers,
      connection_health, posting_enabled, userId
    ]);

    console.log(`✅ Created social media account: ${platform}/${username}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Social media account created successfully'
    });

  } catch (error) {
    console.error('❌ Failed to create social media account:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Account already exists for this platform and username'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create social media account',
      error: error.message
    });
  }
});

// Update account status (connect/disconnect/refresh)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, error_message, warning_message } = req.body;

    const updateQuery = `
      UPDATE social_media_account
      SET
        status = $1,
        error_message = $2,
        warning_message = $3,
        last_sync = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await query(updateQuery, [status, error_message, warning_message, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    console.log(`✅ Updated account status: ${id} -> ${status}`);

    res.json({
      success: true,
      data: result.rows[0],
      message: `Account status updated to ${status}`
    });

  } catch (error) {
    console.error('❌ Failed to update account status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account status',
      error: error.message
    });
  }
});

// Delete account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM social_media_account WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    console.log(`✅ Deleted social media account: ${id}`);

    res.json({
      success: true,
      message: 'Social media account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Failed to delete social media account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social media account',
      error: error.message
    });
  }
});

// Get account statistics
router.get('/meta/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warnings,
        COUNT(CASE WHEN platform = 'twitter' THEN 1 END) as twitter,
        COUNT(CASE WHEN platform = 'linkedin' THEN 1 END) as linkedin,
        COUNT(CASE WHEN platform = 'instagram' THEN 1 END) as instagram,
        COUNT(CASE WHEN platform = 'blog' THEN 1 END) as blog,
        SUM(followers) as total_followers
      FROM social_media_account
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        connected: parseInt(stats.connected),
        errors: parseInt(stats.errors),
        warnings: parseInt(stats.warnings),
        platforms: {
          twitter: parseInt(stats.twitter),
          linkedin: parseInt(stats.linkedin),
          instagram: parseInt(stats.instagram),
          blog: parseInt(stats.blog)
        },
        total_followers: parseInt(stats.total_followers) || 0
      }
    });

    console.log('✅ Retrieved social media account statistics');

  } catch (error) {
    console.error('❌ Failed to fetch account statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account statistics',
      error: error.message
    });
  }
});

module.exports = router;
