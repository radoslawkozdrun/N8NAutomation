const jwt = require('jsonwebtoken');
const { query } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists and is valid
    const sessionResult = await query(`
      SELECT us.*, u.username, u.email, u.role, u.is_active
      FROM user_session us
      JOIN "user" u ON us.user_id = u.id
      WHERE us.session_token = $1 
        AND us.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = true
    `, [token]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const user = sessionResult.rows[0];
    req.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId: user.id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Audit logging middleware
const auditLog = (action, resourceType = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after successful response
      if (res.statusCode < 400 && req.user) {
        logAuditAction(
          req.user.id,
          action,
          resourceType,
          req.params.id || null,
          {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query
          },
          req.ip,
          req.get('User-Agent')
        ).catch(err => {
          console.error('Audit log error:', err);
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Helper function to log audit actions
const logAuditAction = async (userId, action, resourceType, resourceId, details, ipAddress, userAgent) => {
  try {
    await query(`
      INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]);
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Create session
const createSession = async (userId, token, ipAddress, userAgent) => {
  try {
    // Clean up expired sessions
    await query('DELETE FROM user_session WHERE expires_at < CURRENT_TIMESTAMP');
    
    // Create new session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const result = await query(`
      INSERT INTO user_session (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [userId, token, expiresAt, ipAddress, userAgent]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
};

// Delete session
const deleteSession = async (token) => {
  try {
    await query('DELETE FROM user_session WHERE session_token = $1', [token]);
  } catch (error) {
    console.error('Failed to delete session:', error);
    throw error;
  }
};

// Middleware to add user filter to queries (only for USER and DEMO roles)
const addUserFilter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // ADMIN can see all data, USER and DEMO only their own data
  if (req.user.role === 'ADMIN') {
    req.userFilter = {}; // No filter for admin
  } else {
    req.userFilter = {
      user_id: req.user.id
    };
  }

  next();
};

// Helper function to add user constraints to WHERE clauses
const addUserConstraint = (whereConditions, params, userFilter, paramIndex) => {
  if (userFilter.user_id) {
    whereConditions.push(`user_id = $${paramIndex}`);
    params.push(userFilter.user_id);
    return paramIndex + 1;
  }
  return paramIndex;
};

// Middleware to ensure user owns resource for non-admin user
const requireOwnershipOrAdmin = (resourceType = 'resource') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // ADMIN can access any resource
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For non-admin user, check ownership
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID required'
      });
    }

    try {
      let checkQuery;
      switch (resourceType) {
        case 'feed':
          checkQuery = 'SELECT user_id FROM sp_feed WHERE id = $1';
          break;
        case 'article':
          checkQuery = 'SELECT user_id FROM sp_content WHERE id = $1';
          break;
        case 'post':
          checkQuery = 'SELECT created_by as user_id FROM sp_posts WHERE id = $1';
          break;
        default:
          return res.status(500).json({
            success: false,
            message: 'Unknown resource type'
          });
      }

      const result = await query(checkQuery, [resourceId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`
        });
      }

      const resourceUserId = result.rows[0].user_id;
      if (resourceUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not resource owner'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify resource ownership'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  auditLog,
  generateToken,
  createSession,
  deleteSession,
  logAuditAction,
  addUserFilter,
  addUserConstraint,
  requireOwnershipOrAdmin,
  JWT_SECRET
};