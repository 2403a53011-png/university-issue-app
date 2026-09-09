const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST or PUT feedback for a resolved issue
router.post('/:issueId/feedback', authenticateToken, (req, res) => {
  const { issueId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    if (req.user.role !== 'student' || issue.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the student who raised this issue can provide resolution feedback.' });
    }

    if (issue.status !== 'Resolved') {
      return res.status(400).json({ error: 'Feedback can only be submitted once the issue is marked as Resolved.' });
    }

    const existing = db.prepare('SELECT id FROM feedback WHERE issue_id = ?').get(issueId);
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE feedback
        SET rating = ?, comment = ?, created_at = ?
        WHERE issue_id = ?
      `).run(Math.round(rating), comment ? comment.trim() : null, now, issueId);
    } else {
      const fbId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      db.prepare(`
        INSERT INTO feedback (id, issue_id, student_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(fbId, issueId, req.user.id, Math.round(rating), comment ? comment.trim() : null, now);
    }

    // Notify admins of feedback
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    for (const admin of admins) {
      const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      insertNotif.run(
        notifId,
        admin.id,
        issue.id,
        `Student ${req.user.name} submitted a ${rating}-star feedback on resolved issue ${issue.id}.`,
        now
      );
    }

    const savedFeedback = db.prepare('SELECT * FROM feedback WHERE issue_id = ?').get(issueId);
    res.json({
      message: 'Feedback submitted successfully. Thank you!',
      feedback: savedFeedback
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
});

module.exports = router;
