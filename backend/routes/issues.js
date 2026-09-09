const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper to generate next Issue ID
function generateIssueId() {
  const year = new Date().getFullYear();
  const row = db.prepare(`SELECT id FROM issues WHERE id LIKE 'ISS-${year}-%' ORDER BY id DESC LIMIT 1`).get();
  let nextNum = 1;
  if (row && row.id) {
    const parts = row.id.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
  }
  return `ISS-${year}-${String(nextNum).padStart(3, '0')}`;
}

// GET /api/issues - List issues with filtering, search, and role isolation
router.get('/', authenticateToken, (req, res) => {
  try {
    const { category, priority, status, search, sort = 'newest' } = req.query;

    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];

    // Security check: Students can only access their own issues
    if (req.user.role === 'student') {
      query += ' AND student_id = ?';
      params.push(req.user.id);
    } else if (req.query.studentId) {
      query += ' AND student_id = ?';
      params.push(req.query.studentId);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (priority && priority !== 'All') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ' AND (id LIKE ? OR student_name LIKE ? OR student_id LIKE ? OR title LIKE ? OR description LIKE ?)';
      params.push(term, term, term, term, term);
    }

    // Sorting
    if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'priority') {
      query += ` ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC, created_at DESC`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const issues = db.prepare(query).all(...params);
    res.json({ issues });
  } catch (err) {
    console.error('List issues error:', err);
    res.status(500).json({ error: 'Failed to retrieve issues.' });
  }
});

// GET /api/issues/:id - Fetch issue details, conversation thread, and feedback
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    // Role check
    if (req.user.role === 'student' && issue.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own issues.' });
    }

    // Fetch replies
    const replies = db.prepare(`
      SELECT * FROM replies
      WHERE issue_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    // Fetch feedback if any
    const feedback = db.prepare(`
      SELECT * FROM feedback
      WHERE issue_id = ?
    `).get(req.params.id);

    // Fetch student profile details for the issue view
    const student = db.prepare(`
      SELECT id, name, email, department, year FROM users WHERE id = ?
    `).get(issue.student_id);

    res.json({
      issue,
      student,
      replies,
      feedback: feedback || null
    });
  } catch (err) {
    console.error('Get issue error:', err);
    res.status(500).json({ error: 'Failed to retrieve issue details.' });
  }
});

// POST /api/issues - Submit a new issue
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can raise new issues.' });
  }

  const { title, description, category, priority } = req.body;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({ error: 'Title, description, category, and priority are required.' });
  }

  const validCategories = [
    'Academic', 'Examination', 'Faculty', 'Classroom',
    'Hostel', 'Transport', 'Infrastructure', 'Library',
    'Internet / Wi-Fi', 'Other'
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category specified.' });
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Must be Low, Medium, or High.' });
  }

  try {
    const issueId = generateIssueId();
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO issues (id, student_id, student_name, title, description, category, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `);

    insert.run(
      issueId,
      req.user.id,
      req.user.name,
      title.trim(),
      description.trim(),
      category,
      priority,
      now,
      now
    );

    // Student Confirmation Notification
    const notifId1 = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(
      notifId1,
      req.user.id,
      issueId,
      `Your issue ${issueId} ("${title.trim()}") was successfully submitted and is Pending review.`,
      now
    );

    // Admin Notification
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    for (const admin of admins) {
      const notifId2 = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      insertNotif.run(
        notifId2,
        admin.id,
        issueId,
        `New issue ${issueId} raised by ${req.user.name} (${req.user.id}): "${title.trim()}" [${priority} Priority]`,
        now
      );
    }

    const createdIssue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);

    res.status(201).json({
      message: 'Issue submitted successfully',
      issue: createdIssue
    });
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ error: 'Failed to submit issue.' });
  }
});

// PATCH /api/issues/:id/status - Admin status change & optional update note
router.patch('/:id/status', authenticateToken, requireRole('admin'), (req, res) => {
  const { status, note } = req.body;

  const validStatuses = ['Pending', 'Under Review', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status specified.' });
  }

  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE issues
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run(status, now, req.params.id);

    // If an official note/reply was included during status transition
    if (note && note.trim()) {
      const replyId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      db.prepare(`
        INSERT INTO replies (id, issue_id, sender_id, sender_name, sender_role, message, created_at)
        VALUES (?, ?, ?, ?, 'admin', ?, ?)
      `).run(replyId, req.params.id, req.user.id, req.user.name, note.trim(), now);
    }

    // Send notification to the student
    const notifMsg = status === 'Resolved'
      ? `Your issue ${issue.id} has been marked as Resolved. Please provide your resolution feedback and rating.`
      : `The status of your issue ${issue.id} ("${issue.title}") was changed to "${status}".`;

    const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(notifId, issue.student_id, issue.id, notifMsg, now);

    const updatedIssue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
    const replies = db.prepare('SELECT * FROM replies WHERE issue_id = ? ORDER BY created_at ASC').all(req.params.id);

    res.json({
      message: `Status updated to ${status}`,
      issue: updatedIssue,
      replies
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update issue status.' });
  }
});

module.exports = router;
