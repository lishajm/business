// routes/reports.js
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('developer'), async (req, res) => {
  try {
    const { proposal_id, work_done, issues_faced, hours_worked, is_final } = req.body;
    if (!work_done || !hours_worked) return res.status(400).json({ error: 'work_done and hours_worked are required' });
    const result = await run(
      'INSERT INTO reports (developer_id, proposal_id, work_done, issues_faced, hours_worked, is_final) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, proposal_id || null, work_done, issues_faced || null, hours_worked, is_final ? 1 : 0]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Report submitted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/my', authenticate, requireRole('developer'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT r.*, p.project_title FROM reports r LEFT JOIN proposals p ON r.proposal_id = p.id WHERE r.developer_id = ? ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/developer/:dev_id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT r.*, p.project_title, u.name as developer_name FROM reports r JOIN users u ON r.developer_id = u.id LEFT JOIN proposals p ON r.proposal_id = p.id WHERE r.developer_id = ? ORDER BY r.created_at DESC`,
      [req.params.dev_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT r.*, p.project_title, u.name as developer_name FROM reports r JOIN users u ON r.developer_id = u.id LEFT JOIN proposals p ON r.proposal_id = p.id ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
