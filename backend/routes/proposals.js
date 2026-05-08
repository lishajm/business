// routes/proposals.js
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('client'), async (req, res) => {
  try {
    const { business_name, client_name, project_title, industry, description, objectives, scope_of_work, deliverables, timeline, budget } = req.body;
    if (!business_name || !project_title || !description) return res.status(400).json({ error: 'Required fields missing' });
    const result = await run(
      `INSERT INTO proposals (client_id, business_name, client_name, project_title, industry, description, objectives, scope_of_work, deliverables, timeline, budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, business_name, client_name, project_title, industry, description, objectives||null, scope_of_work||null, deliverables||null, timeline||null, budget||null]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Proposal submitted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/my', authenticate, requireRole('client'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT p.*, u.name as client_user_name FROM proposals p JOIN users u ON p.client_id = u.id
       WHERE p.client_id = ? ORDER BY p.created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT p.*, u.name as client_user_name, u.email as client_email
       FROM proposals p JOIN users u ON p.client_id = u.id ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/assigned', authenticate, requireRole('developer'), async (req, res) => {
  try {
    const rows = await all(
      `SELECT p.*, a.deadline, a.instructions, a.status as assignment_status, u.name as client_name_user
       FROM proposals p JOIN assignments a ON p.id = a.proposal_id JOIN users u ON p.client_id = u.id
       WHERE a.developer_id = ? ORDER BY a.assigned_at DESC`, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const proposal = await get(
      `SELECT p.*, u.name as client_user_name, u.email as client_email,
              a.developer_id, a.deadline, a.instructions, a.status as assignment_status, d.name as developer_name
       FROM proposals p JOIN users u ON p.client_id = u.id
       LEFT JOIN assignments a ON p.id = a.proposal_id LEFT JOIN users d ON a.developer_id = d.id
       WHERE p.id = ?`, [req.params.id]);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (req.user.role === 'client' && proposal.client_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (req.user.role === 'developer' && proposal.developer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json(proposal);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/review', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, admin_notes, estimated_cost, admin_timeline } = req.body;
    const validStatuses = ['approved','modified','rejected','quoted','standard_selected','accepted','negotiation_requested'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await run(
      `UPDATE proposals SET status=?, admin_notes=?, estimated_cost=?, admin_timeline=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [status, admin_notes||null, estimated_cost||null, admin_timeline||null, req.params.id]);
    res.json({ message: `Proposal ${status} successfully` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
