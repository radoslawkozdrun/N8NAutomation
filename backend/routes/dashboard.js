const express = require('express');
const { query } = require('../database');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Get total pending articles
    const pendingResult = await query(`
      SELECT COUNT(*) as total_pending 
      FROM sp_content 
      WHERE status = 'PENDING_REVIEW'
    `);
    const totalPending = parseInt(pendingResult.rows[0].total_pending);

    // Get average score
    const avgScoreResult = await query(`
      SELECT AVG(final_score) as avg_score 
      FROM sp_content 
      WHERE final_score IS NOT NULL AND status = 'PENDING_REVIEW'
    `);
    const averageScore = parseFloat(avgScoreResult.rows[0].avg_score) || 0;

    // Get category distribution
    const categoryResult = await query(`
      SELECT category, COUNT(*) as count 
      FROM sp_content 
      WHERE status = 'PENDING_REVIEW' AND category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    const categoryDistribution = {};
    categoryResult.rows.forEach(row => {
      categoryDistribution[row.category] = parseInt(row.count);
    });

    // Get priority distribution
    const priorityResult = await query(`
      SELECT priority, COUNT(*) as count 
      FROM sp_content 
      WHERE status = 'PENDING_REVIEW' AND priority IS NOT NULL
      GROUP BY priority 
      ORDER BY count DESC
    `);
    
    const priorityDistribution = {};
    priorityResult.rows.forEach(row => {
      priorityDistribution[row.priority] = parseInt(row.count);
    });

    // Get recent activity (last 10 actions)
    const activityResult = await query(`
      SELECT 
        id,
        title,
        status,
        created_date,
        reviewed_at,
        reviewed_by
      FROM sp_content 
      WHERE status IN ('ACCEPTED', 'REJECTED', 'ARCHIVED')
      ORDER BY COALESCE(reviewed_at, created_date) DESC 
      LIMIT 10
    `);

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