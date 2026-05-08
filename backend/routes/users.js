// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// ── Register admin/developer (admin only) ─────────────────────────────────
router.post('/register', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (!['admin', 'developer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or developer' });
    }

    const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const result = await run(
      'INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, 1)',
      [name, email, hash, role]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: `${role} registered successfully`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Register client (public) ─────────────────────────────────────────────
router.post('/register/client', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const result = await run(
      "INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, 'client', 0)",
      [name, email, hash]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Registration successful. Please wait for admin approval before logging in.'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all users (admin only) ────────────────────────────────────────────
router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await all(
      `SELECT id, name, email, role, created_at, is_active, is_approved, approved_by
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get pending clients ───────────────────────────────────────────────────
router.get('/pending', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await all(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'client' AND is_approved = 0 AND is_active = 1
       ORDER BY created_at ASC`
    );
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get developers ────────────────────────────────────────────────────────
router.get('/developers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await all(
      `SELECT id, name, email
       FROM users
       WHERE role = 'developer' AND is_active = 1`
    );
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Approve client ────────────────────────────────────────────────────────
router.put('/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'client') {
      return res.status(400).json({ error: 'Only clients need approval' });
    }

    await run(
      'UPDATE users SET is_approved = 1, approved_by = ? WHERE id = ?',
      [req.user.id, req.params.id]
    );

    res.json({
      message: `Client "${user.name}" approved successfully`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Reject client ─────────────────────────────────────────────────────────
router.put('/:id/reject', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'client') {
      return res.status(400).json({ error: 'Only clients can be rejected' });
    }

    await run(
      'UPDATE users SET is_approved = 0, approved_by = NULL WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: `Client "${user.name}" access revoked`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Toggle active/inactive ───────────────────────────────────────────────
router.patch('/:id/toggle', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const user = await get('SELECT id, is_active FROM users WHERE id = ?', [req.params.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await run(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [user.is_active ? 0 : 1, req.params.id]
    );

    res.json({ message: 'User status toggled' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Login logs ───────────────────────────────────────────────────────────
router.get('/logs', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const logs = await all(
      `SELECT l.*, u.name, u.email, u.role
       FROM logs l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.login_time DESC
       LIMIT 200`
    );

    res.json(logs);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;