const express = require('express');
const { query } = require('../database');
const { authenticateToken, requireAdmin, auditLog, addUserFilter, addUserConstraint } = require('../middleware/auth');

const router = express.Router();

// Get all domains with pagination and filtering
router.get('/domains', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      active,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      queryParams.push(active === 'true');
    }

    if (search) {
      whereConditions.push(`(domain_name ILIKE $${paramIndex++} OR domain_id ILIKE $${paramIndex++})`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
      paramIndex += 1; // We added 2 more params but incremented by 1 already
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM domain
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get domains with pagination
    queryParams.push(limit, offset);
    const domainsQuery = `
      SELECT 
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
      FROM domain
      ${whereClause}
      ORDER BY domain_name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const domainsResult = await query(domainsQuery, queryParams);

    res.json({
      success: true,
      data: domainsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting domains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get domains'
    });
  }
});

// Get single domain by ID
router.get('/domains/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
      FROM domain 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get domain'
    });
  }
});

// Create new domain (admin only)
router.post('/domains', authenticateToken, requireAdmin, auditLog('CREATE_DOMAIN', 'domain'), async (req, res) => {
  try {
    const { domain_id, domain_name, config, is_active = true } = req.body;

    // Validation
    if (!domain_id || !domain_name || !config) {
      return res.status(400).json({
        success: false,
        message: 'domain_id, domain_name, and config are required'
      });
    }

    // Check if domain_id already exists
    const existingDomain = await query('SELECT id FROM domain WHERE domain_id = $1', [domain_id]);
    if (existingDomain.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Domain with this domain_id already exists'
      });
    }

    // Insert new domain
    const result = await query(`
      INSERT INTO domain (domain_id, domain_name, config, is_active, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING 
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
    `, [domain_id, domain_name, JSON.stringify(config), is_active, req.user.username]);

    res.status(201).json({
      success: true,
      message: 'Domain created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create domain'
    });
  }
});

// Update domain (admin only)
router.put('/domains/:id', authenticateToken, requireAdmin, auditLog('UPDATE_DOMAIN', 'domain'), async (req, res) => {
  try {
    const { id } = req.params;
    const { domain_id, domain_name, config, is_active } = req.body;

    // Check if domain exists
    const existingDomain = await query('SELECT id, domain_id, version FROM domain WHERE id = $1', [id]);
    if (existingDomain.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // If domain_id is being changed, check for duplicates
    if (domain_id && domain_id !== existingDomain.rows[0].domain_id) {
      const duplicateCheck = await query('SELECT id FROM domain WHERE domain_id = $1 AND id != $2', [domain_id, id]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Domain with this domain_id already exists'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (domain_id !== undefined) {
      updates.push(`domain_id = $${paramIndex++}`);
      values.push(domain_id);
    }
    if (domain_name !== undefined) {
      updates.push(`domain_name = $${paramIndex++}`);
      values.push(domain_name);
    }
    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`);
      values.push(JSON.stringify(config));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    // Always update version and metadata
    updates.push(`version = version + 1`);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramIndex++}`);
    values.push(req.user.username);
    values.push(id);

    const updateQuery = `
      UPDATE domain 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, domain_id, domain_name, config, version, is_active,
        created_at, updated_at, created_by, updated_by
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Domain updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update domain'
    });
  }
});

// Toggle domain active status (admin only)
router.patch('/domains/:id/toggle', authenticateToken, requireAdmin, auditLog('TOGGLE_DOMAIN', 'domain'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE domain 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP, updated_by = $2, version = version + 1
      WHERE id = $1
      RETURNING 
        id, domain_id, domain_name, is_active, updated_at
    `, [id, req.user.username]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    const domain = result.rows[0];
    res.json({
      success: true,
      message: `Domain ${domain.is_active ? 'activated' : 'deactivated'} successfully`,
      data: domain
    });
  } catch (error) {
    console.error('Error toggling domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle domain status'
    });
  }
});

// Delete domain (admin only)
router.delete('/domains/:id', authenticateToken, requireAdmin, auditLog('DELETE_DOMAIN', 'domain'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if domain is being used by any feeds
    const feedCheck = await query('SELECT COUNT(*) as count FROM feed WHERE domain_id = $1', [id]);
    if (feedCheck.rows[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete domain that is being used by feeds'
      });
    }

    const result = await query(`
      DELETE FROM domain 
      WHERE id = $1
      RETURNING domain_id, domain_name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      message: `Domain "${result.rows[0].domain_name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete domain'
    });
  }
});

// Get domain statistics
router.get('/domains/meta/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_domains,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_domains,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_domains,
        AVG(version) as avg_version
      FROM domain
    `;

    const categoryStatsQuery = `
      SELECT 
        d.domain_name,
        COUNT(f.id) as feed_count,
        COUNT(CASE WHEN f.enabled = true THEN 1 END) as active_feeds
      FROM domain d
      LEFT JOIN feed f ON d.id = f.domain_id
      WHERE d.is_active = true
      GROUP BY d.id, d.domain_name
      ORDER BY feed_count DESC
    `;

    const [statsResult, categoryResult] = await Promise.all([
      query(statsQuery),
      query(categoryStatsQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          ...statsResult.rows[0],
          avg_version: parseFloat(statsResult.rows[0].avg_version) || 1
        },
        domains: categoryResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting domain stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get domain statistics'
    });
  }
});

module.exports = router;