const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats - Dashboard analytics based on role
router.get('/', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = req.user.id;

      const total = db.prepare('SELECT COUNT(*) as count FROM issues WHERE student_id = ?').get(studentId).count;
      const pending = db.prepare("SELECT COUNT(*) as count FROM issues WHERE student_id = ? AND status = 'Pending'").get(studentId).count;
      const underReview = db.prepare("SELECT COUNT(*) as count FROM issues WHERE student_id = ? AND status = 'Under Review'").get(studentId).count;
      const resolved = db.prepare("SELECT COUNT(*) as count FROM issues WHERE student_id = ? AND status = 'Resolved'").get(studentId).count;
      const rejected = db.prepare("SELECT COUNT(*) as count FROM issues WHERE student_id = ? AND status = 'Rejected'").get(studentId).count;

      const recentIssues = db.prepare(`
        SELECT * FROM issues
        WHERE student_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `).all(studentId);

      return res.json({
        total,
        pending,
        underReview,
        resolved,
        rejected,
        recentIssues
      });
    } else {
      // Admin stats
      const total = db.prepare('SELECT COUNT(*) as count FROM issues').get().count;
      const pending = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Pending'").get().count;
      const underReview = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Under Review'").get().count;
      const resolved = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Resolved'").get().count;
      const rejected = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Rejected'").get().count;
      const highPriority = db.prepare("SELECT COUNT(*) as count FROM issues WHERE priority = 'High' AND status != 'Resolved' AND status != 'Rejected'").get().count;

      const categoryBreakdown = db.prepare(`
        SELECT category, COUNT(*) as count
        FROM issues
        GROUP BY category
        ORDER BY count DESC
      `).all();

      const avgRating = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM feedback').get();

      const recentIssues = db.prepare(`
        SELECT * FROM issues
        ORDER BY created_at DESC
        LIMIT 6
      `).all();

      return res.json({
        total,
        pending,
        underReview,
        resolved,
        rejected,
        highPriority,
        categoryBreakdown,
        feedbackSummary: {
          average: avgRating.avg ? Number(avgRating.avg.toFixed(1)) : 0,
          totalReviews: avgRating.count
        },
        recentIssues
      });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

module.exports = router;
