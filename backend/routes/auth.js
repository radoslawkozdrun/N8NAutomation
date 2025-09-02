const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { query } = require('../database');
const { 
  generateToken, 
  createSession, 
  deleteSession, 
  authenticateToken,
  requireAdmin,
  auditLog
} = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register endpoint (admin only for creating new user)
router.post('/register', authRateLimit, authenticateToken, requireAdmin, auditLog('CREATE_USER', 'user'), async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM "user" WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(`
      INSERT INTO "user" (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `, [username, email, passwordHash, role]);

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Login endpoint
router.post('/login', authRateLimit, auditLog('LOGIN', 'auth'), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log(`Login failed - missing credentials from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user
    const userResult = await query(`
      SELECT id, username, email, password_hash, role, is_active, last_login
      FROM "user" 
      WHERE (username = $1 OR email = $1) AND is_active = true
    `, [username]);

    if (userResult.rows.length === 0) {
      console.log(`Login failed - user not found: ${username} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log(`Login failed - invalid password for user: ${username} (ID: ${user.id}) from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Create session
    const session = await createSession(
      user.id,
      token,
      req.ip,
      req.get('User-Agent')
    );

    // Update last login
    await query(
      'UPDATE "user" SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    console.error(`Login error from IP ${req.ip}:`, error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, auditLog('LOGOUT', 'auth'), async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await deleteSession(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(`
      SELECT id, username, email, role, created_at, last_login
      FROM "user" 
      WHERE id = $1
    `, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, auditLog('UPDATE_PROFILE', 'user'), async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user data
    const userResult = await query(
      'SELECT password_hash FROM "user" WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Update email if provided
    if (email && email !== req.user.email) {
      // Check if email already exists
      const emailCheck = await query(
        'SELECT id FROM "user" WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }

      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(newPasswordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    // Perform update
    values.push(userId);
    const updateQuery = `
      UPDATE "user" 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex}
      RETURNING id, username, email, role, updated_at
    `;

    const result = await query(updateQuery, values);
    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get all user (admin only)
router.get('/user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, username, email, role, is_active, created_at, last_login
      FROM "user" 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Update user (admin only)
router.put('/user/:id', authenticateToken, requireAdmin, auditLog('UPDATE_USER', 'user'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (typeof is_active === 'boolean') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    values.push(userId);
    const updateQuery = `
      UPDATE "user" 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex}
      RETURNING id, username, email, role, is_active, updated_at
    `;

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Validate token endpoint
router.get('/validate', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

module.exports = router;