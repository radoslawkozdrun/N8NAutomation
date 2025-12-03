const express = require('express');
const { query } = require('../src/database');
const { authenticateToken, addUserFilter, addUserConstraint } = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/dashboard/stats', authenticateToken, addUserFilter, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Build user filter conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Add user filter first (for non-admin users)
    paramIndex = addUserConstraint(conditions, params, req.userFilter, paramIndex);
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const whereClauseWithStatus = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')} AND status = $${paramIndex}` 
      : `WHERE status = $${paramIndex}`;
    
    // Get total pending articles
    const pendingResult = await query(`
      SELECT COUNT(*) as total_pending 
      FROM content 
      ${whereClauseWithStatus}
    `, [...params, 'PENDING_REVIEW']);
    const totalPending = parseInt(pendingResult.rows[0].total_pending);

    // Get average score
    const avgScoreResult = await query(`
      SELECT AVG(final_score) as avg_score 
      FROM content 
      ${whereClauseWithStatus} AND final_score IS NOT NULL
    `, [...params, 'PENDING_REVIEW']);
    const averageScore = parseFloat(avgScoreResult.rows[0].avg_score) || 0;

    // Get category distribution
    const categoryResult = await query(`
      SELECT category, COUNT(*) as count 
      FROM content 
      ${whereClauseWithStatus} AND category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `, [...params, 'PENDING_REVIEW']);
    
    const categoryDistribution = {};
    categoryResult.rows.forEach(row => {
      categoryDistribution[row.category] = parseInt(row.count);
    });

    // Get priority distribution
    const priorityResult = await query(`
      SELECT priority, COUNT(*) as count 
      FROM content 
      ${whereClauseWithStatus} AND priority IS NOT NULL
      GROUP BY priority 
      ORDER BY count DESC
    `, [...params, 'PENDING_REVIEW']);
    
    const priorityDistribution = {};
    priorityResult.rows.forEach(row => {
      priorityDistribution[row.priority] = parseInt(row.count);
    });

    // Get recent activity (last 10 actions)
    const activityWhereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')} AND status IN ('ACCEPTED', 'REJECTED', 'ARCHIVED')` 
      : `WHERE status IN ('ACCEPTED', 'REJECTED', 'ARCHIVED')`;
    
    const activityResult = await query(`
      SELECT 
        id,
        title,
        status,
        created_date,
        reviewed_at,
        reviewed_by
      FROM content 
      ${activityWhereClause}
      ORDER BY COALESCE(reviewed_at, created_date) DESC 
      LIMIT 10
    `, params);

    const recentActivity = activityResult.rows.map(row => ({
      id: `act_${row.id}`,
      action: row.status.toLowerCase(),
      article_title: row.title,
      timestamp: row.reviewed_at || row.created_date,
      user: row.reviewed_by || 'system'
    }));

    const stats = {
      total_pending: totalPending,
      average_score: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      category_distribution: categoryDistribution,
      priority_distribution: priorityDistribution,
      recent_activity: recentActivity
    };

    console.log(`✅ Dashboard stats: ${totalPending} pending, avg score: ${averageScore.toFixed(1)}`);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      code: 'DASHBOARD_ERROR'
    });
  }
});

module.exports = router;
