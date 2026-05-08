// routes/assignments.js
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { proposal_id, developer_id, deadline, instructions } = req.body;
    if (!proposal_id || !developer_id || !deadline) return res.status(400).json({ error: 'Required fields missing' });
    const dev = await get("SELECT id FROM users WHERE id = ? AND role = 'developer'", [developer_id]);
    if (!dev) return res.status(400).json({ error: 'Developer not found' });

    // Upsert assignment
    const existing = await get('SELECT id FROM assignments WHERE proposal_id = ?', [proposal_id]);
    if (existing) {
      await run('UPDATE assignments SET developer_id = ?, deadline = ?, instructions = ?, status = ? WHERE proposal_id = ?',
        [developer_id, deadline, instructions || null, 'assigned', proposal_id]);
    } else {
      await run('INSERT INTO assignments (proposal_id, developer_id, deadline, instructions) VALUES (?, ?, ?, ?)',
        [proposal_id, developer_id, deadline, instructions || null]);
    }
    await run("UPDATE proposals SET status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [proposal_id]);
    res.json({ message: 'Developer assigned successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:proposal_id/status', authenticate, requireRole('developer'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['in_progress', 'completed', 'blocked'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await run('UPDATE assignments SET status = ? WHERE proposal_id = ? AND developer_id = ?',
      [status, req.params.proposal_id, req.user.id]);
    if (status === 'completed') {
      await run("UPDATE proposals SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.proposal_id]);
    }
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
