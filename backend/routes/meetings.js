// routes/meetings.js — Bidirectional meeting scheduling (client & admin both can initiate)
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// CLIENT or ADMIN: Request meeting
router.post('/', authenticate, async (req, res) => {
  try {
    const { proposal_id, preferred_date, preferred_time, notes, meeting_link } = req.body;
    if (!proposal_id || !preferred_date || !preferred_time)
      return res.status(400).json({ error: 'Required fields missing' });

    let client_id;
    if (req.user.role === 'client') {
      const proposal = await get('SELECT id, client_id FROM proposals WHERE id = ? AND client_id = ?', [proposal_id, req.user.id]);
      if (!proposal) return res.status(403).json({ error: 'Proposal not found or not yours' });
      client_id = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin initiating — get client from proposal
      const proposal = await get('SELECT id, client_id FROM proposals WHERE id = ?', [proposal_id]);
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
      client_id = proposal.client_id;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await run(
      'INSERT INTO meetings (proposal_id, client_id, requested_by, preferred_date, preferred_time, notes, meeting_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [proposal_id, client_id, req.user.role, preferred_date, preferred_time, notes || null, meeting_link || null]
    );

    // If admin initiates, auto-approve
    if (req.user.role === 'admin') {
      await run("UPDATE meetings SET status = 'approved', admin_date = ?, admin_time = ?, admin_note = ? WHERE id = ?",
        [preferred_date, preferred_time, notes || null, result.lastInsertRowid]);
    }

    res.status(201).json({ id: result.lastInsertRowid, message: 'Meeting scheduled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CLIENT: Get own meetings
router.get('/my', authenticate, requireRole('client'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT m.*, p.project_title FROM meetings m JOIN proposals p ON m.proposal_id = p.id
       WHERE m.client_id = ? ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN: Get all meetings
router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT m.*, p.project_title, u.name as client_name, u.email as client_email
       FROM meetings m JOIN proposals p ON m.proposal_id = p.id JOIN users u ON m.client_id = u.id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN or CLIENT: Update meeting (admin approves/reschedules, client can cancel)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, admin_date, admin_time, admin_note, meeting_link } = req.body;
    const meeting = await get('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (req.user.role === 'admin') {
      if (!['approved', 'rescheduled', 'rejected'].includes(status))
        return res.status(400).json({ error: 'Invalid status' });
      await run(
        'UPDATE meetings SET status = ?, admin_date = ?, admin_time = ?, admin_note = ?, meeting_link = ? WHERE id = ?',
        [status, admin_date || meeting.preferred_date, admin_time || meeting.preferred_time, admin_note, meeting_link || null, req.params.id]
      );
    } else if (req.user.role === 'client') {
      if (meeting.client_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      if (status !== 'cancelled') return res.status(400).json({ error: 'Clients can only cancel meetings' });
      await run("UPDATE meetings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ message: `Meeting ${status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
