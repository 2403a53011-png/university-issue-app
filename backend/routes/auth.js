const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password, expectedRole } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/ID and password are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR id = ?').get(username.trim(), username.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Role check if requested specifically
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({ error: `This account is registered as a ${user.role}. Please log in via the ${user.role} portal.` });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, username, email, role, department, year, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  const { email, department, year } = req.body;

  try {
    const update = db.prepare(`
      UPDATE users
      SET email = COALESCE(?, email),
          department = COALESCE(?, department),
          year = COALESCE(?, year)
      WHERE id = ?
    `);

    update.run(email || null, department || null, year || null, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, username, email, role, department, year, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
