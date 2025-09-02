const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all posts with optional status filter
router.get('/', /* authenticateToken, */ async (req, res) => {
  console.log('🔍 Root endpoint hit, originalUrl:', req.originalUrl);
  if (req.originalUrl === '/api/posts/test') {
    console.log('🔍 Test endpoint hit via root route');
    return res.json({ success: true, message: 'Posts endpoint working' });
  }
  try {
    console.log('🔍 Posts request params:', req.query);
    const { status, platform } = req.query;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    let sqlQuery = `
      SELECT 
        p.*
      FROM post p
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;
    
    if (status && status !== 'all' && status.trim() !== '') {
      paramCount++;
      conditions.push(`p.status = $${paramCount}`);
      params.push(status);
    }
    
    if (platform) {
      paramCount++;
      conditions.push(`p.platform = $${paramCount}`);
      params.push(platform);
    }
    
    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sqlQuery += ` ORDER BY p.created_at DESC`;
    
    if (limit) {
      paramCount++;
      sqlQuery += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      paramCount++;
      sqlQuery += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));
    }
    
    console.log('🔍 Final SQL Query:', sqlQuery);
    console.log('🔍 Query Params:', params);
    
    const result = await query(sqlQuery, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM post p';
    const countConditions = [];
    const countParams = [];
    let countParamCount = 0;
    
    if (status && status !== 'all' && status.trim() !== '') {
      countParamCount++;
      countConditions.push(`p.status = $${countParamCount}`);
      countParams.push(status);
    }
    
    if (platform) {
      countParamCount++;
      countConditions.push(`p.platform = $${countParamCount}`);
      countParams.push(platform);
    }
    
    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      posts: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

// Get single post by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        p.*
      FROM post p
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch post',
      error: error.message 
    });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      platform,
      source_article_id,
      scheduled_publish_date,
      metadata
    } = req.body;
    
    // Validation
    if (!title || !content || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and platform are required'
      });
    }
    
    const result = await query(`
      INSERT INTO post (
        title, 
        content, 
        platform, 
        source_article_id,
        created_by,
        scheduled_publish_date,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title, 
      content, 
      platform, 
      source_article_id || null,
      req.user.id,
      scheduled_publish_date || null,
      metadata ? JSON.stringify(metadata) : null
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create post',
      error: error.message 
    });
  }
});

// Approve post
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      UPDATE post 
      SET 
        status = 'APPROVED_FOR_PUBLISHING',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'PENDING_REVIEW'
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not in PENDING_REVIEW status'
      });
    }
    
    res.json({
      success: true,
      message: 'Post approved successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve post',
      error: error.message 
    });
  }
});

// Reject post
router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const result = await query(`
      UPDATE post 
      SET 
        status = 'NEEDS_REVISION',
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'PENDING_REVIEW'
      RETURNING *
    `, [id, reason]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not in PENDING_REVIEW status'
      });
    }
    
    res.json({
      success: true,
      message: 'Post rejected successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject post',
      error: error.message 
    });
  }
});

// Update post status to published
router.post('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      UPDATE post 
      SET 
        status = 'PUBLISHED',
        published_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'APPROVED_FOR_PUBLISHING'
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not APPROVED_FOR_PUBLISHING for publishing'
      });
    }
    
    res.json({
      success: true,
      message: 'Post marked as published',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to publish post',
      error: error.message 
    });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      platform,
      scheduled_publish_date,
      metadata
    } = req.body;
    
    // Only allow updates for posts in pending or rejected status
    const existingPost = await query('SELECT status FROM post WHERE id = $1', [id]);
    
    if (existingPost.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const currentStatus = existingPost.rows[0].status;
    if (!['pending', 'rejected'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Can only update posts in pending or rejected status'
      });
    }
    
    const result = await query(`
      UPDATE post 
      SET 
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        platform = COALESCE($4, platform),
        scheduled_publish_date = COALESCE($5, scheduled_publish_date),
        metadata = COALESCE($6, metadata),
        status = 'pending',
        reviewed_by = NULL,
        reviewed_at = NULL,
        rejection_reason = NULL
      WHERE id = $1
      RETURNING *
    `, [
      id,
      title || null,
      content || null,
      platform || null,
      scheduled_publish_date || null,
      metadata ? JSON.stringify(metadata) : null
    ]);
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update post',
      error: error.message 
    });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow deletion for posts in pending or rejected status
    const result = await query(`
      DELETE FROM post 
      WHERE id = $1 AND status IN ('pending', 'rejected')
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or cannot be deleted (only pending/rejected posts can be deleted)'
      });
    }
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete post',
      error: error.message 
    });
  }
});

// Get post statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        status,
        platform,
        COUNT(*) as count
      FROM post 
      GROUP BY status, platform
      ORDER BY status, platform
    `);
    
    const totalResult = await query('SELECT COUNT(*) as total FROM post');
    const total = parseInt(totalResult.rows[0].total);
    
    // Organize stats by status
    const stats = {
      total,
      by_status: {},
      by_platform: {}
    };
    
    result.rows.forEach(row => {
      // By status
      if (!stats.by_status[row.status]) {
        stats.by_status[row.status] = 0;
      }
      stats.by_status[row.status] += parseInt(row.count);
      
      // By platform
      if (!stats.by_platform[row.platform]) {
        stats.by_platform[row.platform] = 0;
      }
      stats.by_platform[row.platform] += parseInt(row.count);
    });
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch post statistics',
      error: error.message 
    });
  }
});

module.exports = router;