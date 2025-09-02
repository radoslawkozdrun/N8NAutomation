const express = require('express');
const { query } = require('../database');
const { authenticateToken, requireAdmin, auditLog, addUserFilter, addUserConstraint, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all feeds with pagination and filtering
router.get('/feeds', authenticateToken, addUserFilter, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
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
    if (category) {
      whereConditions.push(`category = $${paramIndex++}`);
      queryParams.push(category);
    }

    if (enabled !== undefined) {
      whereConditions.push(`enabled = $${paramIndex++}`);
      queryParams.push(enabled === 'true');
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex++} OR url ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 2; // We added 2 more params
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

    // Get feeds with pagination
    queryParams.push(limit, offset);
    const feedsQuery = `
      SELECT 
        id, name, url, description, category, enabled,
        created_at, updated_at, last_checked, error_count, last_error
      FROM feed
      ${whereClause}
      ORDER BY name ASC
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

// Get single feed by ID
router.get('/feeds/:id', authenticateToken, requireOwnershipOrAdmin('feed'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id, name, url, description, category, enabled,
        created_at, updated_at, last_checked, error_count, last_error
      FROM feed 
      WHERE id = $1
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
    const { name, url, description, category, enabled = true } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required'
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

    // Insert new feed with user_id
    const result = await query(`
      INSERT INTO feed (name, url, description, category, enabled, value, type, user_id)
      VALUES ($1, $2, $3, $4, $5, $2, 'RSS', $6)
      RETURNING 
        id, name, url, description, category, enabled,
        created_at, updated_at
    `, [name, url, description, category, enabled, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Feed created successfully',
      data: result.rows[0]
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
    const { name, url, description, category, enabled } = req.body;

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
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (enabled !== undefined) {
      updates.push(`enabled = $${paramIndex++}`);
      values.push(enabled);
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
      RETURNING 
        id, name, url, description, category, enabled,
        created_at, updated_at, last_checked, error_count
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Feed updated successfully',
      data: result.rows[0]
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
router.get('/feeds/meta/categories', authenticateToken, addUserFilter, async (req, res) => {
  try {
    // Build WHERE clause with user filter
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    paramIndex = addUserConstraint(conditions, params, req.userFilter, paramIndex);
    conditions.push('category IS NOT NULL');
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await query(`
      SELECT DISTINCT category
      FROM feed 
      ${whereClause}
      ORDER BY category
    `, params);

    res.json({
      success: true,
      data: result.rows.map(row => row.category)
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
    const categoryConditions = [...conditions, 'category IS NOT NULL'];
    const categoryWhereClause = categoryConditions.length > 0 ? 'WHERE ' + categoryConditions.join(' AND ') : '';

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

    const categoryStatsQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_count
      FROM feed 
      ${categoryWhereClause}
      GROUP BY category
      ORDER BY count DESC
    `;

    const [statsResult, categoryResult] = await Promise.all([
      query(statsQuery, params),
      query(categoryStatsQuery, params)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          ...statsResult.rows[0],
          avg_error_count: parseFloat(statsResult.rows[0].avg_error_count) || 0
        },
        categories: categoryResult.rows
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

module.exports = router;