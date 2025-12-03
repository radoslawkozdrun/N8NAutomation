const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query } = require('../src/database');

const router = express.Router();

// Get all config properties with filters and pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      data_type,
      is_active,
      is_encrypted
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    if (search.trim()) {
      paramCount++;
      whereConditions.push(`(key ILIKE $${paramCount} OR description ILIKE $${paramCount} OR value ILIKE $${paramCount})`);
      queryParams.push(`%${search.trim()}%`);
    }

    if (data_type) {
      paramCount++;
      whereConditions.push(`data_type = $${paramCount}`);
      queryParams.push(data_type);
    }

    if (is_active !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      queryParams.push(is_active === 'true');
    }

    if (is_encrypted !== undefined) {
      paramCount++;
      whereConditions.push(`is_encrypted = $${paramCount}`);
      queryParams.push(is_encrypted === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM config_property
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated properties
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const propertiesQuery = `
      SELECT
        id,
        key,
        value,
        description,
        data_type,
        is_encrypted,
        is_active,
        created_at,
        updated_at,
        created_by,
        updated_by
      FROM config_property
      ${whereClause}
      ORDER BY key ASC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    console.log('📄 Fetching config properties with filters:', { page, limit, search, data_type, is_active, is_encrypted });

    const propertiesResult = await query(propertiesQuery, queryParams);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: propertiesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

    console.log(`✅ Found ${propertiesResult.rows.length} config properties (${total} total)`);

  } catch (error) {
    console.error('❌ Failed to fetch config properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch config properties',
      error: error.message
    });
  }
});

// Get single config property by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const propertyQuery = `
      SELECT
        id,
        key,
        value,
        description,
        data_type,
        is_encrypted,
        is_active,
        created_at,
        updated_at,
        created_by,
        updated_by
      FROM config_property
      WHERE id = $1
    `;

    const result = await query(propertyQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Config property not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Failed to fetch config property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch config property',
      error: error.message
    });
  }
});

// Create new config property
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      key,
      value,
      description,
      data_type = 'string',
      is_encrypted = false,
      is_active = true
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }

    const insertQuery = `
      INSERT INTO config_property (
        key, value, description, data_type, is_encrypted, is_active, created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      key.trim(), value || '', description || '', data_type, is_encrypted, is_active, userId, userId
    ]);

    console.log(`✅ Created config property: ${key}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Config property created successfully'
    });

  } catch (error) {
    console.error('❌ Failed to create config property:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Config property with this key already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create config property',
      error: error.message
    });
  }
});

// Update config property
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      key,
      value,
      description,
      data_type,
      is_encrypted,
      is_active
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }

    const updateQuery = `
      UPDATE config_property
      SET
        key = $1,
        value = $2,
        description = $3,
        data_type = $4,
        is_encrypted = $5,
        is_active = $6,
        updated_by = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const result = await query(updateQuery, [
      key.trim(), value || '', description || '', data_type || 'string',
      is_encrypted || false, is_active !== undefined ? is_active : true, userId, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Config property not found'
      });
    }

    console.log(`✅ Updated config property: ${key}`);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Config property updated successfully'
    });

  } catch (error) {
    console.error('❌ Failed to update config property:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Config property with this key already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update config property',
      error: error.message
    });
  }
});

// Delete config property
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM config_property WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Config property not found'
      });
    }

    console.log(`✅ Deleted config property: ${result.rows[0].key}`);

    res.json({
      success: true,
      message: 'Config property deleted successfully'
    });

  } catch (error) {
    console.error('❌ Failed to delete config property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete config property',
      error: error.message
    });
  }
});

// Bulk toggle active status
router.patch('/bulk/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ids, is_active } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const updateQuery = `
      UPDATE config_property
      SET
        is_active = $${ids.length + 1},
        updated_by = $${ids.length + 2},
        updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
      RETURNING key
    `;

    const result = await query(updateQuery, [...ids, is_active, userId]);

    console.log(`✅ Bulk updated ${result.rows.length} config properties`);

    res.json({
      success: true,
      message: `Updated ${result.rows.length} config properties`,
      updated_keys: result.rows.map(row => row.key)
    });

  } catch (error) {
    console.error('❌ Failed to bulk update config properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update config properties',
      error: error.message
    });
  }
});

module.exports = router;
