const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database');
const { authenticateToken, requireAdmin, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get all user (admin only)
router.get('/user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      active,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (role) {
      whereConditions.push(`role = $${paramIndex++}`);
      queryParams.push(role);
    }

    if (active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      queryParams.push(active === 'true');
    }

    if (search) {
      whereConditions.push(`(username ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
      paramIndex += 1; // We added 2 params but only increment by 1 more
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM "user"
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get user with pagination
    queryParams.push(limit, offset);
    const userQuery = `
      SELECT 
        id, username, email, role, is_active,
        created_at, updated_at, last_login
      FROM "user"
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const userResult = await query(userQuery, queryParams);

    res.json({
      success: true,
      data: userResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Get single user by ID (admin only)
router.get('/user/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id, username, email, role, is_active,
        created_at, updated_at, last_login
      FROM "user" 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Create new user (admin only)
router.post('/user', authenticateToken, requireAdmin, auditLog('CREATE_USER', 'user'), async (req, res) => {
  try {
    const { username, email, password, role = 'USER', is_active = true } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'USER', 'DEMO'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, USER, or DEMO'
      });
    }

    // Check if username or email already exists
    const existingUser = await query(
      'SELECT id FROM "user" WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(`
      INSERT INTO "user" (username, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, username, email, role, is_active,
        created_at, updated_at
    `, [username, email, passwordHash, role, is_active]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/user/:id', authenticateToken, requireAdmin, auditLog('UPDATE_USER', 'user'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, is_active } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id, username, email FROM "user" WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If username or email is being changed, check for duplicates
    if ((username && username !== existingUser.rows[0].username) || 
        (email && email !== existingUser.rows[0].email)) {
      const duplicateCheck = await query(
        'SELECT id FROM "user" WHERE (username = $1 OR email = $2) AND id != $3',
        [username || existingUser.rows[0].username, email || existingUser.rows[0].email, id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this username or email already exists'
        });
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['ADMIN', 'USER', 'DEMO'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be ADMIN, USER, or DEMO'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (password !== undefined) {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
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

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE "user" 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, username, email, role, is_active,
        created_at, updated_at, last_login
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Toggle user active status (admin only)
router.patch('/user/:id/toggle', authenticateToken, requireAdmin, auditLog('TOGGLE_USER', 'user'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const result = await query(`
      UPDATE "user" 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id, username, email, is_active, updated_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

// Delete user (admin only)
router.delete('/user/:id', authenticateToken, requireAdmin, auditLog('DELETE_USER', 'user'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await query(`
      DELETE FROM "user" 
      WHERE id = $1
      RETURNING username, email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User "${result.rows[0].username}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get user statistics (admin only)
router.get('/user/meta/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_user,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_user,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_user,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admin_user,
        COUNT(CASE WHEN role = 'USER' THEN 1 END) as regular_user,
        COUNT(CASE WHEN role = 'DEMO' THEN 1 END) as demo_user,
        COUNT(CASE WHEN last_login > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END) as recent_logins
      FROM "user"
    `;

    const roleStatsQuery = `
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
      FROM "user"
      GROUP BY role
      ORDER BY count DESC
    `;

    const [statsResult, roleResult] = await Promise.all([
      query(statsQuery),
      query(roleStatsQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        by_role: roleResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

module.exports = router;