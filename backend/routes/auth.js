process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lishajm.cs@gmail.com';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const { run, get } = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// ── Resend email client ───────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY || 're_jdvYxhTn_4kAXYgKSjD8sNY53LoRje33Y');

// ── Send OTP Email ────────────────────────────────────────────────────────
async function sendOTPEmail(otp) {
  await resend.emails.send({
    from: 'BPQG Security <onboarding@resend.dev>',
    to: 'lishajm.cs@gmail.com',  // must match your Resend account email
    subject: 'Your BPQG Admin OTP',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;background:#0f2027;border-radius:16px;padding:36px;color:white;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#38b2ac,#2c7a7b);display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:20px;">✓</span>
          </div>
          <span style="font-size:22px;font-weight:700;letter-spacing:1.5px;">BPQG</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;">Admin Login OTP</h2>
        <p style="color:rgba(255,255,255,0.55);margin:0 0 28px;font-size:14px;">
          Use the code below to complete your admin login. It expires in <strong style="color:#81e6d9;">5 minutes</strong>.
        </p>
        <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:42px;font-weight:700;letter-spacing:12px;color:#81e6d9;">${otp}</span>
        </div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">
          If you did not attempt to login, please ignore this email. Do not share this OTP with anyone.
        </p>
      </div>
    `,
  });
}

// ── DEBUG: Check admin exists (remove after confirming) ───────────────────
router.get('/debug-admin', async (req, res) => {
  try {
    const admin = await get("SELECT id, name, email, role, is_active FROM users WHERE role='admin'");
    res.json(admin || { error: 'No admin found in DB' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── LOGIN (Step 1) ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ error: 'Email, password and role required' });

    const user = await get(
      'SELECT * FROM users WHERE email = ? AND role = ? AND is_active = 1',
      [email, role]
    );

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    // ── Client: must be approved ──────────────────────────────────────────
    if (user.role === 'client' && !user.is_approved) {
      return res.status(403).json({
        error: 'Your account is pending admin approval. Please wait for confirmation.'
      });
    }

    // ── Admin: direct login (no OTP) ─────────────────────────────────────
    // OTP removed - admin logs in directly with email + password

    // ── Developer + Client: direct login ─────────────────────────────────
    const now = new Date().toISOString();
    const logResult = await run(
      'INSERT INTO logs (user_id, login_time) VALUES (?, ?)',
      [user.id, now]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, logId: logResult.lastInsertRowid },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ── VERIFY OTP (Step 2 - Admin only) ─────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ error: 'userId and otp required' });

    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user)
      return res.status(404).json({ error: 'User not found' });

    if (!user.temp_otp)
      return res.status(401).json({ error: 'No OTP requested. Please login again.' });

    if (new Date() > new Date(user.otp_expiry)) {
      await run('UPDATE users SET temp_otp = NULL, otp_expiry = NULL WHERE id = ?', [user.id]);
      return res.status(401).json({ error: 'OTP has expired. Please login again.' });
    }

    if (user.temp_otp !== otp.toString()) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    }

    await run(
      'UPDATE users SET temp_otp = NULL, otp_expiry = NULL WHERE id = ?',
      [user.id]
    );

    const now = new Date().toISOString();
    const logResult = await run(
      'INSERT INTO logs (user_id, login_time) VALUES (?, ?)',
      [user.id, now]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, logId: logResult.lastInsertRowid },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── LOGOUT ────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { logId } = req.user;
    if (logId) {
      const log = await get('SELECT login_time FROM logs WHERE id = ?', [logId]);
      if (log) {
        const now = new Date();
        const loginTime = new Date(log.login_time);
        const durationHours = ((now - loginTime) / 3600000).toFixed(4);
        await run(
          'UPDATE logs SET logout_time = ?, work_duration = ? WHERE id = ?',
          [now.toISOString(), durationHours, logId]
        );
      }
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET CURRENT USER ──────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;