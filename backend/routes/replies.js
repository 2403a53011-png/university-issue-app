const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/issues/:issueId/replies - Add a message to an issue conversation thread
router.post('/:issueId/replies', authenticateToken, (req, res) => {
  const { issueId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    // Role check: Only the issue creator or an admin can reply
    if (req.user.role === 'student' && issue.student_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to reply to this issue.' });
    }

    const replyId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO replies (id, issue_id, sender_id, sender_name, sender_role, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      replyId,
      issueId,
      req.user.id,
      req.user.name,
      req.user.role,
      message.trim(),
      now
    );

    // Update issue updated_at
    db.prepare('UPDATE issues SET updated_at = ? WHERE id = ?').run(now, issueId);

    // Send notifications to the counter-party
    const snippet = message.trim().length > 60 ? message.trim().substring(0, 60) + '...' : message.trim();

    if (req.user.role === 'admin') {
      // Notify the student
      const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      db.prepare(`
        INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(
        notifId,
        issue.student_id,
        issue.id,
        `Admin ${req.user.name} replied to your issue ${issue.id}: "${snippet}"`,
        now
      );
    } else {
      // Student replied -> notify admin
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
          `Student ${req.user.name} added a reply on issue ${issue.id}: "${snippet}"`,
          now
        );
      }
    }

    const createdReply = db.prepare('SELECT * FROM replies WHERE id = ?').get(replyId);
    res.status(201).json({
      message: 'Reply added successfully',
      reply: createdReply
    });
  } catch (err) {
    console.error('Add reply error:', err);
    res.status(500).json({ error: 'Failed to post reply.' });
  }
});

module.exports = router;
