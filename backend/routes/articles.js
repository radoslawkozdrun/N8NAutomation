const express = require('express');
const { query } = require('../database');
const { authenticateToken, addUserFilter, addUserConstraint, requireOwnershipOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Helper function to parse tags and key_takeaways
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  
  try {
    // Try JSON parse first
    return JSON.parse(field);
  } catch {
    // Fallback to comma/semicolon separated
    return field.split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
  }
};

// Helper function to build WHERE clause for filters
const buildWhereClause = (filters, userFilter = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Add user filter first (for non-admin users)
  paramIndex = addUserConstraint(conditions, params, userFilter, paramIndex);

  // Filter by status
  // If status is undefined, default to 'PENDING_REVIEW'
  // If status is explicitly empty string, don't filter by status (show all)
  if (filters.status === undefined) {
    conditions.push(`status = $${paramIndex}`);
    params.push('PENDING_REVIEW');
    paramIndex++;
  } else if (filters.status && filters.status !== '') {
    conditions.push(`status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  // If filters.status === '', no status condition is added (show all statuses)

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.priority) {
    conditions.push(`priority = $${paramIndex}`);
    params.push(filters.priority);
    paramIndex++;
  }

  if (filters.target_audience) {
    conditions.push(`target_audience = $${paramIndex}`);
    params.push(filters.target_audience);
    paramIndex++;
  }

  if (filters.score_min) {
    conditions.push(`final_score >= $${paramIndex}`);
    params.push(parseFloat(filters.score_min));
    paramIndex++;
  }

  if (filters.score_max) {
    conditions.push(`final_score <= $${paramIndex}`);
    params.push(parseFloat(filters.score_max));
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`(
      title ILIKE $${paramIndex} OR 
      content ILIKE $${paramIndex} OR 
      author ILIKE $${paramIndex} OR
      tags ILIKE $${paramIndex}
    )`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.tags) {
    const tagArray = filters.tags.split(',').map(tag => tag.trim());
    const tagConditions = tagArray.map(tag => {
      const condition = `tags ILIKE $${paramIndex}`;
      params.push(`%${tag}%`);
      paramIndex++;
      return condition;
    });
    conditions.push(`(${tagConditions.join(' OR ')})`);
  }

  return {
    whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
    paramIndex
  };
};

// GET /api/articles
router.get('/articles', authenticateToken, addUserFilter, async (req, res) => {
  try {
    console.log('📄 Fetching articles with filters:', req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    // Build filters
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort_by;
    delete filters.sort_order;

    const { whereClause, params, paramIndex } = buildWhereClause(filters, req.userFilter);

    // Build ORDER BY clause
    let orderBy = 'ORDER BY created_date DESC';
    if (req.query.sort_by) {
      const validSortFields = ['final_score', 'created_date', 'priority'];
      const sortBy = validSortFields.includes(req.query.sort_by) ? req.query.sort_by : 'final_score';
      const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';
      
      if (sortBy === 'priority') {
        // Custom priority sorting (P0 = highest, P4 = lowest)
        orderBy = `ORDER BY 
          CASE priority 
            WHEN 'P0_BREAKING' THEN 1 
            WHEN 'P1_TRENDING' THEN 2 
            WHEN 'P2_TIMELY' THEN 3 
            WHEN 'P3_EVERGREEN' THEN 4 
            WHEN 'P4_FILLER' THEN 5 
            ELSE 6 
          END ${sortOrder}`;
      } else {
        orderBy = `ORDER BY ${sortBy} ${sortOrder}`;
      }
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM content ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get articles
    const articlesQuery = `
      SELECT 
        id,
        title,
        author,
        link,
        summary,
        content,
        category,
        subcategory,
        tags,
        priority,
        target_audience,
        relevance_score,
        novelty_score,
        viral_score,
        value_score,
        final_score,
        key_takeways,
        reasoning,
        status,
        created_date
      FROM content 
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const articlesResult = await query(articlesQuery, [...params, limit, offset]);

    // Process articles data
    const articles = articlesResult.rows.map(article => ({
      ...article,
      tags: parseArrayField(article.tags),
      key_takeaways: parseArrayField(article.key_takeways),
      // Ensure scores are numbers
      relevance_score: parseFloat(article.relevance_score) || 0,
      novelty_score: parseFloat(article.novelty_score) || 0,
      viral_score: parseFloat(article.viral_score) || 0,
      value_score: parseFloat(article.value_score) || 0,
      final_score: parseFloat(article.final_score) || 0,
    }));

    console.log(`✅ Found ${articles.length} articles (${total} total)`);

    res.json({
      data: articles,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Articles fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      code: 'ARTICLES_FETCH_ERROR'
    });
  }
});

// GET /api/articles/:id
router.get('/articles/:id', authenticateToken, requireOwnershipOrAdmin('article'), async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    console.log(`📄 Fetching article ${articleId}`);

    const result = await query(`
      SELECT 
        id, title, author, link, summary, content, category, subcategory,
        tags, priority, target_audience, relevance_score, novelty_score,
        viral_score, value_score, final_score, key_takeways, reasoning,
        status, created_date
      FROM content 
      WHERE id = $1
    `, [articleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    const article = {
      ...result.rows[0],
      tags: parseArrayField(result.rows[0].tags),
      key_takeaways: parseArrayField(result.rows[0].key_takeways),
      relevance_score: parseFloat(result.rows[0].relevance_score) || 0,
      novelty_score: parseFloat(result.rows[0].novelty_score) || 0,
      viral_score: parseFloat(result.rows[0].viral_score) || 0,
      value_score: parseFloat(result.rows[0].value_score) || 0,
      final_score: parseFloat(result.rows[0].final_score) || 0,
    };

    console.log(`✅ Found article: ${article.title}`);

    res.json({
      success: true,
      data: article
    });

  } catch (error) {
    console.error('❌ Article fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      code: 'ARTICLE_FETCH_ERROR'
    });
  }
});

// POST /api/articles/:id/decision
router.post('/articles/:id/decision', authenticateToken, requireOwnershipOrAdmin('article'), async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { action, notes } = req.body;
    
    console.log(`⚡ Processing decision for article ${articleId}: ${action}`);

    // Validate action
    const validActions = ['accept', 'reject', 'needs_more'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be accept, reject, or needs_more',
        code: 'INVALID_ACTION'
      });
    }

    // Map actions to status
    const statusMap = {
      'accept': 'ACCEPTED',
      'reject': 'REJECTED',
      'needs_more': 'NEEDS_MORE'
    };

    const newStatus = statusMap[action];
    const now = new Date().toISOString();

    // Update article
    const updateResult = await query(`
      UPDATE content 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [newStatus, articleId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    const updatedArticle = {
      ...updateResult.rows[0],
      tags: parseArrayField(updateResult.rows[0].tags),
      key_takeaways: parseArrayField(updateResult.rows[0].key_takeways),
    };

    console.log(`✅ Article ${articleId} ${action}ed successfully`);

    res.json({
      success: true,
      data: updatedArticle,
      message: `Article ${action}ed successfully`
    });

  } catch (error) {
    console.error('❌ Article decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article status',
      code: 'ARTICLE_UPDATE_ERROR'
    });
  }
});

// POST /api/articles/bulk-update
router.post('/articles/bulk-update', authenticateToken, addUserFilter, async (req, res) => {
  try {
    const { articleIds, action, notes } = req.body;
    
    console.log(`⚡ Processing bulk ${action} for ${articleIds.length} articles`);

    // Validate input
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'articleIds must be a non-empty array',
        code: 'INVALID_INPUT'
      });
    }

    const validActions = ['accept', 'reject'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be accept or reject for bulk operations',
        code: 'INVALID_ACTION'
      });
    }

    const statusMap = {
      'accept': 'ACCEPTED',
      'reject': 'REJECTED'
    };

    const newStatus = statusMap[action];
    const now = new Date().toISOString();

    // Build placeholders for IN clause and add user filter
    const placeholders = articleIds.map((_, index) => `$${index + 2}`).join(',');
    
    let whereClause = `id IN (${placeholders})`;
    let params = [newStatus, ...articleIds];
    
    // Add user filter for non-admin users
    if (req.userFilter.user_id) {
      whereClause += ` AND user_id = $${params.length + 1}`;
      params.push(req.userFilter.user_id);
    }

    const updateResult = await query(`
      UPDATE content 
      SET status = $1
      WHERE ${whereClause}
      RETURNING id
    `, params);

    const updatedCount = updateResult.rows.length;
    const failedCount = articleIds.length - updatedCount;

    console.log(`✅ Bulk ${action}: ${updatedCount} successful, ${failedCount} failed`);

    res.json({
      success: true,
      data: {
        updated_count: updatedCount,
        failed_count: failedCount,
        failed_ids: failedCount > 0 ? articleIds.filter(id => 
          !updateResult.rows.some(row => row.id === id)
        ) : []
      },
      message: `${updatedCount} articles ${action}ed successfully`
    });

  } catch (error) {
    console.error('❌ Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update articles',
      code: 'BULK_UPDATE_ERROR'
    });
  }
});

// GET /api/articles/tags
router.get('/articles/tags', authenticateToken, addUserFilter, async (req, res) => {
  try {
    // Build WHERE clause with user filter
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    paramIndex = addUserConstraint(conditions, params, req.userFilter, paramIndex);
    conditions.push('tags IS NOT NULL');
    conditions.push("tags != ''");
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await query(`
      SELECT DISTINCT unnest(string_to_array(tags, ',')) as tag
      FROM content 
      ${whereClause}
      ORDER BY tag
    `, params);

    const tags = result.rows
      .map(row => row.tag.trim())
      .filter(tag => tag.length > 0);

    res.json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('❌ Tags fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      code: 'TAGS_FETCH_ERROR'
    });
  }
});

// GET /api/articles/categories
router.get('/articles/categories', authenticateToken, addUserFilter, async (req, res) => {
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
      FROM content 
      ${whereClause}
      ORDER BY category
    `, params);

    const categories = result.rows.map(row => row.category);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('❌ Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      code: 'CATEGORIES_FETCH_ERROR'
    });
  }
});

// Get research materials for an article
router.get('/articles/:id/research', authenticateToken, requireOwnershipOrAdmin('article'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // For research, we check if user owns the article via the requireOwnershipOrAdmin middleware
    // No additional user filtering needed here since ownership is already verified
    const result = await query(`
      SELECT 
        id,
        search_id,
        source_url,
        research_type,
        content,
        author,
        title,
        publication_date,
        created_at
      FROM research 
      WHERE article_id = $1
      ORDER BY created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching research materials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch research materials',
      error: error.message 
    });
  }
});

module.exports = router;