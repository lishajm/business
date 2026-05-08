// routes/quotations.js  — AI keyword engine + 3-tier flow + PDF
const express = require('express');
const router  = express.Router();
const PDFDocument = require('pdfkit');
const { run, get, all } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════
//  AI KEYWORD PRICING ENGINE
//  Each keyword found in title / description / objectives /
//  scope_of_work adds a multiplier or flat amount to the base
// ═══════════════════════════════════════════════════════════════
const KEYWORD_RULES = [
  // ── Technology stack keywords ──────────────────────────────
  { words: ['blockchain','smart contract','web3','nft','defi','crypto'],  add: 120000, label: 'Blockchain / Web3' },
  { words: ['ai','artificial intelligence','machine learning','ml','deep learning','llm','nlp'], add: 100000, label: 'AI / ML Integration' },
  { words: ['ar','vr','augmented reality','virtual reality','mixed reality'], add: 90000,  label: 'AR / VR' },
  { words: ['iot','internet of things','embedded','firmware','rtos'],       add: 80000,  label: 'IoT / Embedded' },
  { words: ['app interface','mobile app','android','ios','flutter','react native','kotlin','swift'], add: 70000, label: 'Mobile App Interface' },
  { words: ['web interface','web app','webapp','website','react','vue','angular','next.js','nuxt'], add: 50000, label: 'Web Interface' },
  { words: ['desktop app','electron','wpf','winforms','macos app'],         add: 45000,  label: 'Desktop App' },
  { words: ['api','rest api','graphql','microservices','backend'],          add: 35000,  label: 'API / Backend' },
  { words: ['database','postgresql','mysql','mongodb','redis','supabase'],  add: 25000,  label: 'Database Design' },
  { words: ['cloud','aws','azure','gcp','devops','docker','kubernetes','ci/cd'], add: 40000, label: 'Cloud / DevOps' },
  { words: ['payment gateway','payment integration','stripe','razorpay','paypal'], add: 30000, label: 'Payment Gateway' },
  { words: ['e-commerce','ecommerce','online store','shopping cart'],       add: 45000,  label: 'E-Commerce' },
  { words: ['erp','crm','inventory','hrms','accounting system'],            add: 60000,  label: 'Enterprise System' },
  { words: ['analytics','dashboard','reporting','data visualization','bi'], add: 30000,  label: 'Analytics / BI Dashboard' },
  { words: ['real-time','realtime','websocket','live','streaming'],         add: 35000,  label: 'Real-Time Features' },
  { words: ['security','cybersecurity','penetration testing','encryption','2fa','sso'], add: 40000, label: 'Security & Compliance' },
  { words: ['admin panel','cms','content management','backoffice'],         add: 20000,  label: 'Admin Panel / CMS' },
  { words: ['multi-language','multilingual','localization','i18n'],         add: 15000,  label: 'Multi-Language Support' },
  { words: ['seo','search engine','google ranking'],                        add: 15000,  label: 'SEO Optimization' },
  { words: ['social login','oauth','google login','facebook login'],        add: 10000,  label: 'Social Auth / OAuth' },
  { words: ['notification','push notification','email automation','sms'],  add: 15000,  label: 'Notification System' },
  { words: ['map','gps','geolocation','google maps','location tracking'],   add: 20000,  label: 'Maps / Geolocation' },
  { words: ['video','streaming video','zoom','webrtc','video call'],        add: 50000,  label: 'Video / WebRTC' },
  { words: ['chat','messaging','whatsapp','telegram','chatbot'],            add: 35000,  label: 'Chat / Messaging' },
  { words: ['data migration','legacy','integration','third-party'],         add: 25000,  label: 'Data Migration / Integration' },
  // ── Scale / complexity keywords ────────────────────────────
  { words: ['enterprise','large scale','high traffic','millions of users'], add: 80000,  label: 'Enterprise Scale' },
  { words: ['startup','mvp','prototype','poc'],                             add: -10000, label: 'MVP / Prototype (lean build)' },
  { words: ['maintenance','support contract','sla','uptime guarantee'],     add: 20000,  label: 'Support / SLA' },
];

function analyzeKeywords(proposal) {
  const text = [
    proposal.project_title, proposal.description, proposal.objectives,
    proposal.scope_of_work, proposal.deliverables, proposal.industry
  ].filter(Boolean).join(' ').toLowerCase();

  const detected = [];
  let totalAdd = 0;

  for (const rule of KEYWORD_RULES) {
    for (const word of rule.words) {
      if (text.includes(word)) {
        detected.push({ label: rule.label, amount: rule.add, keyword: word });
        totalAdd += rule.add;
        break; // one hit per rule group
      }
    }
  }
  return { detected, totalAdd };
}

// ── Timeline parser ─────────────────────────────────────────
function parseMonths(t) {
  if (!t) return 3;
  const n = parseInt(t);
  return isNaN(n) ? 3 : n;
}

// ── Full service catalogue per tier ────────────────────────
function buildServiceDetails(tier, detected, proposal) {
  const base = {
    basic: {
      tagline: 'Launch fast with the essentials',
      services: [
        { name: 'Requirements Analysis',         desc: 'Deep-dive sessions to finalise scope and acceptance criteria.' },
        { name: 'UI/UX Wireframing',             desc: 'Lo-fi wireframes for all primary screens.' },
        { name: 'Core Feature Development',      desc: 'All must-have features from the approved scope document.' },
        { name: 'Unit & Integration Testing',    desc: 'Automated test suite covering critical paths.' },
        { name: 'Deployment (Single Server)',     desc: 'Production deployment on one cloud instance.' },
        { name: '30-Day Post-Launch Support',    desc: 'Bug fixes and minor tweaks for 30 days.' },
        { name: 'Basic Documentation',           desc: 'User manual and developer README.' },
      ],
      benefits: [
        'Quickest path to a working product',
        'Minimal budget commitment',
        'Ideal for MVPs and proof-of-concept',
        'Fixed scope = predictable delivery',
      ],
      meetingPolicy: 'No meeting required — project proceeds on approval.',
      alterPolicy:   'Quotation is fixed. No admin alterations.',
    },
    standard: {
      tagline: 'Complete solution with room to refine',
      services: [
        { name: 'Full Requirements Workshop',    desc: '2-day workshop + detailed BRD document.' },
        { name: 'Professional UI/UX Design',     desc: 'Hi-fi mockups, design system, responsive layouts.' },
        { name: 'Advanced Feature Development',  desc: 'Core features + advanced modules per scope.' },
        { name: 'API Integrations',              desc: 'Third-party APIs as identified in scope.' },
        { name: 'Performance Optimisation',      desc: 'Load testing + caching + DB query tuning.' },
        { name: 'Multi-Device Testing (QA)',     desc: 'Manual + automated cross-browser & device QA.' },
        { name: 'Staged Deployment',             desc: 'Staging → UAT → Production pipeline.' },
        { name: '90-Day Post-Launch Support',    desc: 'Priority bug fixes + minor enhancements.' },
        { name: 'Full Documentation Suite',      desc: 'User guide, API docs, deployment runbook.' },
        { name: 'Training Session (2 hrs)',      desc: 'Recorded walkthrough for your team.' },
      ],
      benefits: [
        'Balanced quality vs. cost',
        'Admin can refine quotation after meeting',
        '1 free revision round included',
        'Suitable for growing businesses',
        'Dedicated project manager',
      ],
      meetingPolicy: 'Optional: Schedule a meeting with admin to discuss and customise the scope.',
      alterPolicy:   'Admin may adjust cost and timeline after the consultation meeting.',
    },
    premium: {
      tagline: 'Enterprise-grade. Full ownership. Priority everything.',
      services: [
        { name: 'Executive Discovery Workshop',  desc: '3-day stakeholder workshop, ROI analysis, risk matrix.' },
        { name: 'Custom Design System',          desc: 'Brand-aligned component library for all interfaces.' },
        { name: 'Full-Stack Development',        desc: 'All features, integrations, and custom modules.' },
        { name: 'Dedicated Project Manager',     desc: 'Single point of contact throughout delivery.' },
        { name: 'Priority Development Queue',    desc: 'Your project bypasses standard queue.' },
        { name: 'Security Audit',                desc: 'OWASP compliance check + penetration test report.' },
        { name: 'Scalability Architecture',      desc: 'Auto-scaling, CDN, load-balancer setup.' },
        { name: 'CI/CD Pipeline Setup',          desc: 'GitHub Actions / GitLab CI with auto-deploy.' },
        { name: '180-Day Post-Launch Support',   desc: '24/7 emergency line for first 30 days.' },
        { name: 'Source Code Ownership',         desc: 'Full IP transfer + private repo handover.' },
        { name: 'Comprehensive Docs + Videos',   desc: 'Written docs + Loom video walkthroughs.' },
        { name: 'Training Programme (8 hrs)',    desc: 'Live + recorded training for your entire team.' },
        { name: 'Negotiation Meeting with Admin',desc: 'Direct session to discuss pricing, features & SLA.' },
      ],
      benefits: [
        'No compromise on quality or scale',
        'Direct negotiation — pricing can be adjusted',
        'Source code fully owned by client',
        'White-glove delivery experience',
        'SLA-backed post-launch support',
        'Best for funded startups & enterprises',
      ],
      meetingPolicy: 'Mandatory negotiation meeting with admin before project kickoff.',
      alterPolicy:   'Admin will negotiate and customise this quotation in the meeting.',
    },
  };
  return base[tier] || base.basic;
}

// ── Main quotation generator ────────────────────────────────
function generateQuotations(proposal) {
  const { detected, totalAdd } = analyzeKeywords(proposal);
  const clientBudget = proposal.budget || 50000;
  const baseMonths   = parseMonths(proposal.timeline);

  // AI-adjusted base: max(clientBudget, 50000) + keyword additions
  const aiBase = Math.max(clientBudget, 50000) + totalAdd;

  const GST_RATE = 0.18;

  const makeTier = (tier, multiplier, extraMonths) => {
    const subTotal  = Math.round(aiBase * multiplier);
    const gst       = Math.round(subTotal * GST_RATE);
    const total     = subTotal + gst;
    const timeline  = `${baseMonths + extraMonths} month${baseMonths + extraMonths !== 1 ? 's' : ''}`;
    const details   = buildServiceDetails(tier, detected, proposal);
    return {
      tier, subTotal, gst, total, timeline,
      gstRate: GST_RATE * 100,
      title: details.tagline,
      services: details.services,
      benefits: details.benefits,
      meetingPolicy: details.meetingPolicy,
      alterPolicy:   details.alterPolicy,
      can_negotiate: tier === 'premium' ? 1 : 0,
      can_meet:      tier === 'premium' ? 1 : tier === 'standard' ? 1 : 0,
      detected_keywords: detected,
    };
  };

  return {
    basic:    makeTier('basic',    0.90, 0),
    standard: makeTier('standard', 1.50, 1),
    premium:  makeTier('premium',  2.00, 2),
    keyword_summary: detected,
  };
}

// ═══════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════

// ADMIN: Generate quotations
router.post('/generate/:proposal_id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const pid      = req.params.proposal_id;
    const proposal = await get('SELECT * FROM proposals WHERE id = ?', [pid]);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const { basic, standard, premium, keyword_summary } = generateQuotations(proposal);

    await run('DELETE FROM quotations WHERE proposal_id = ?', [pid]);

    for (const t of [basic, standard, premium]) {
      await run(
        `INSERT INTO quotations
           (proposal_id, tier, title, description, cost, gst_amount, total_cost,
            timeline, services, benefits, meeting_policy, alter_policy,
            can_negotiate, can_meet, detected_keywords)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          pid, t.tier, t.title,
          buildServiceDetails(t.tier, [], proposal).tagline,
          t.subTotal, t.gst, t.total, t.timeline,
          JSON.stringify(t.services),
          JSON.stringify(t.benefits),
          t.meetingPolicy, t.alterPolicy,
          t.can_negotiate, t.can_meet,
          JSON.stringify(t.detected_keywords),
        ]
      );
    }

    await run("UPDATE proposals SET status='quoted', updated_at=CURRENT_TIMESTAMP WHERE id=?", [pid]);

    const quotations = await all('SELECT * FROM quotations WHERE proposal_id = ? ORDER BY cost ASC', [pid]);
    res.json({ message: 'Quotations generated', quotations, keyword_summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET quotations for a proposal
router.get('/proposal/:proposal_id', authenticate, async (req, res) => {
  try {
    const pid = req.params.proposal_id;
    if (req.user.role === 'client') {
      const p = await get('SELECT id FROM proposals WHERE id=? AND client_id=?', [pid, req.user.id]);
      if (!p) return res.status(403).json({ error: 'Access denied' });
    }
    const quotations = await all('SELECT * FROM quotations WHERE proposal_id=? ORDER BY cost ASC', [pid]);
    const selection  = await get('SELECT * FROM quotation_selections WHERE proposal_id=?', [pid]);
    res.json({ quotations, selection });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CLIENT: Select a quotation
router.post('/select', authenticate, requireRole('client'), async (req, res) => {
  try {
    const { proposal_id, quotation_id } = req.body;
    const proposal  = await get('SELECT id FROM proposals WHERE id=? AND client_id=?', [proposal_id, req.user.id]);
    if (!proposal)  return res.status(403).json({ error: 'Not your proposal' });
    const quotation = await get('SELECT * FROM quotations WHERE id=? AND proposal_id=?', [quotation_id, proposal_id]);
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

    const existing = await get('SELECT id FROM quotation_selections WHERE proposal_id=?', [proposal_id]);
    if (existing) {
      await run(
        'UPDATE quotation_selections SET tier=?,quotation_id=?,selected_at=CURRENT_TIMESTAMP WHERE proposal_id=?',
        [quotation.tier, quotation_id, proposal_id]
      );
    } else {
      await run(
        'INSERT INTO quotation_selections (proposal_id,client_id,tier,quotation_id) VALUES (?,?,?,?)',
        [proposal_id, req.user.id, quotation.tier, quotation_id]
      );
    }

    // Status logic per tier
    let newStatus = 'accepted';
    let message   = 'Basic package selected. Admin has been notified to proceed with your project.';
    if (quotation.tier === 'standard') {
      newStatus = 'standard_selected';
      message   = 'Standard package selected! You may now schedule an optional consultation meeting with admin.';
    } else if (quotation.tier === 'premium') {
      newStatus = 'negotiation_requested';
      message   = 'Premium package selected! Please schedule a negotiation meeting with admin to finalise the deal.';
    }

    await run("UPDATE proposals SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [newStatus, proposal_id]);

    res.json({ message, tier: quotation.tier, can_meet: quotation.can_meet, status: newStatus });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN: Edit / alter a quotation (for standard tier after meeting)
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { cost, timeline, admin_note } = req.body;
    const q = await get('SELECT * FROM quotations WHERE id=?', [req.params.id]);
    if (!q) return res.status(404).json({ error: 'Not found' });
    const GST    = 0.18;
    const newSub = cost ? Number(cost) : q.cost;
    const newGst = Math.round(newSub * GST);
    const newTotal = newSub + newGst;
    await run(
      'UPDATE quotations SET cost=?,gst_amount=?,total_cost=?,timeline=?,admin_note=? WHERE id=?',
      [newSub, newGst, newTotal, timeline || q.timeline, admin_note || null, req.params.id]
    );
    res.json({ message: 'Quotation updated', cost: newSub, gst: newGst, total: newTotal });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all selections (admin)
router.get('/selections/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const rows = await all(`
      SELECT qs.*,p.project_title,p.status as proposal_status,
             u.name as client_name,u.email as client_email,
             q.cost,q.gst_amount,q.total_cost,q.tier,q.can_negotiate,q.can_meet
      FROM quotation_selections qs
      JOIN proposals p  ON qs.proposal_id=p.id
      JOIN users u      ON qs.client_id=u.id
      JOIN quotations q ON qs.quotation_id=q.id
      ORDER BY qs.selected_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PDF GENERATION ──────────────────────────────────────────
router.get('/pdf/:quotation_id', authenticate, async (req, res) => {
  try {
    const q = await get('SELECT * FROM quotations WHERE id=?', [req.params.quotation_id]);
    if (!q) return res.status(404).json({ error: 'Quotation not found' });
    const p = await get('SELECT * FROM proposals WHERE id=?', [q.proposal_id]);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });

    // Access check
    if (req.user.role === 'client' && p.client_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    const services  = (() => { try { return JSON.parse(q.services);  } catch { return []; } })();
    const benefits  = (() => { try { return JSON.parse(q.benefits);  } catch { return []; } })();
    const keywords  = (() => { try { return JSON.parse(q.detected_keywords); } catch { return []; } })();

    const INR = (n) => `INR ${Number(n).toLocaleString('en-IN')}`;
    const tierLabel = { basic: 'Basic Package', standard: 'Standard Package', premium: 'Premium Package' };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quotation_${q.tier}_${p.id}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    const W  = doc.page.width - 100;  // usable width
    const BL = 50;                     // base left

    // ── Header bar ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
       .text('BPQG', BL, 22);
    doc.fontSize(10).font('Helvetica')
       .text('Business Proposal & Quotation Generator', BL, 48);
    doc.fontSize(12).font('Helvetica-Bold')
       .text('QUOTATION', 0, 30, { align: 'right', width: doc.page.width - BL });
    doc.moveDown(0.5);

    // ── Tier badge ──────────────────────────────────────────
    const badgeColors = { basic: '#3b82f6', standard: '#7c3aed', premium: '#d97706' };
    const bColor = badgeColors[q.tier] || '#3b82f6';
    doc.rect(BL, 90, 130, 24).fill(bColor);
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
       .text(tierLabel[q.tier] || q.tier, BL + 6, 96);
    doc.fillColor('#1e3a5f');

    // ── Quotation meta ──────────────────────────────────────
    doc.fontSize(9).font('Helvetica').fillColor('#555555');
    const now = new Date();
    doc.text(`Date: ${now.toLocaleDateString('en-IN')}`, BL, 125)
       .text(`Quotation ID: QT-${q.id.toString().padStart(4,'0')}`, BL, 138)
       .text(`Proposal ID:  PR-${p.id.toString().padStart(4,'0')}`, BL, 151);
    doc.text(`Valid For: 30 days from issue date`, BL + 280, 125)
       .text(`Timeline: ${q.timeline}`, BL + 280, 138)
       .text(`GST Rate: ${q.gst_rate || 18}%`, BL + 280, 151);

    doc.moveTo(BL, 168).lineTo(BL + W, 168).strokeColor('#cccccc').stroke();

    // ── Client & Project info ───────────────────────────────
    doc.moveDown(0.3);
    let y = 178;
    doc.fillColor('#1e3a5f').fontSize(11).font('Helvetica-Bold').text('Prepared For', BL, y);
    doc.fillColor('#333333').fontSize(9).font('Helvetica')
       .text(p.client_name || 'Client', BL, y + 15)
       .text(p.business_name, BL, y + 27)
       .text(`Industry: ${p.industry}`, BL, y + 39);

    doc.fillColor('#1e3a5f').fontSize(11).font('Helvetica-Bold').text('Project', BL + 280, y);
    doc.fillColor('#333333').fontSize(9).font('Helvetica')
       .text(p.project_title, BL + 280, y + 15, { width: 220 });

    y += 62;
    doc.moveTo(BL, y).lineTo(BL + W, y).strokeColor('#cccccc').stroke();

    // ── Tagline ─────────────────────────────────────────────
    y += 10;
    doc.fillColor('#1e3a5f').fontSize(13).font('Helvetica-Bold')
       .text(`"${q.title}"`, BL, y, { width: W, align: 'center' });

    // ── Cost Breakdown table ─────────────────────────────────
    y += 28;
    doc.rect(BL, y, W, 18).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
       .text('COST BREAKDOWN', BL + 6, y + 4);
    y += 22;

    const row = (label, value, shade) => {
      if (shade) doc.rect(BL, y, W, 18).fill('#f1f5f9');
      doc.fillColor('#333333').fontSize(9).font('Helvetica')
         .text(label, BL + 6, y + 4)
         .text(value, BL + 6, y + 4, { width: W - 12, align: 'right' });
      y += 18;
    };

    if (keywords.length > 0) {
      row('Base Development Cost', INR(Math.max(p.budget || 50000, 50000)), false);
      keywords.forEach((k, i) => {
        row(`  + ${k.label} (${k.keyword})`, k.amount > 0 ? `+ ${INR(k.amount)}` : `- ${INR(Math.abs(k.amount))}`, i % 2 === 0);
      });
      doc.moveTo(BL, y).lineTo(BL + W, y).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
      y += 4;
    }

    row('Sub-Total (Before GST)', INR(q.cost), false);
    row(`GST @ ${q.gst_rate || 18}%`, INR(q.gst_amount), true);

    // Total row
    doc.rect(BL, y, W, 22).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
       .text('TOTAL AMOUNT PAYABLE', BL + 6, y + 5)
       .text(INR(q.total_cost), BL + 6, y + 5, { width: W - 12, align: 'right' });
    y += 28;

    doc.fillColor('#555555').fontSize(8).font('Helvetica-Oblique')
       .text('* All amounts are in Indian Rupees (INR). GST @ 18% is included as per Government regulations.',
             BL, y, { width: W });
    y += 20;

    // ── Services Offered ────────────────────────────────────
    if (doc.y > 620) doc.addPage();
    y = Math.max(y, doc.y) + 8;
    doc.rect(BL, y, W, 18).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
       .text('SERVICES INCLUDED', BL + 6, y + 4);
    y += 24;

    services.forEach((s, i) => {
      if (y > 720) { doc.addPage(); y = 50; }
      if (i % 2 === 0) doc.rect(BL, y - 2, W, 30).fill('#f8fafc');
      doc.fillColor('#1e3a5f').fontSize(9).font('Helvetica-Bold').text(`✓  ${s.name}`, BL + 6, y);
      doc.fillColor('#555555').fontSize(8).font('Helvetica').text(s.desc, BL + 18, y + 12, { width: W - 24 });
      y += 32;
    });

    // ── Benefits ─────────────────────────────────────────────
    if (y > 680) { doc.addPage(); y = 50; }
    y += 6;
    doc.rect(BL, y, W, 18).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
       .text('HOW THIS HELPS YOUR BUSINESS', BL + 6, y + 4);
    y += 22;

    benefits.forEach((b, i) => {
      if (y > 740) { doc.addPage(); y = 50; }
      if (i % 2 === 0) doc.rect(BL, y - 2, W, 16).fill('#f0fdf4');
      doc.fillColor('#166534').fontSize(9).font('Helvetica').text(`▶  ${b}`, BL + 8, y + 2);
      y += 16;
    });

    // ── Meeting & Alteration policy ──────────────────────────
    if (y > 680) { doc.addPage(); y = 50; }
    y += 10;
    const policyColor = q.tier === 'premium' ? '#fef3c7' : q.tier === 'standard' ? '#eff6ff' : '#f0fdf4';
    const policyBorder = q.tier === 'premium' ? '#d97706' : q.tier === 'standard' ? '#3b82f6' : '#16a34a';
    doc.rect(BL, y, W, 46).fill(policyColor);
    doc.moveTo(BL, y).lineTo(BL, y + 46).strokeColor(policyBorder).lineWidth(3).stroke();
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Meeting Policy:', BL + 10, y + 6);
    doc.fillColor('#334155').fontSize(8).font('Helvetica').text(q.meeting_policy, BL + 10, y + 18, { width: W - 20 });
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Alteration Policy:', BL + 10, y + 32);
    doc.fillColor('#334155').fontSize(8).font('Helvetica').text(q.alter_policy, BL + 95, y + 32, { width: W - 105 });
    y += 56;

    // ── Keyword analysis ─────────────────────────────────────
    if (keywords.length > 0) {
      if (y > 680) { doc.addPage(); y = 50; }
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold').text('AI Cost Factors Detected:', BL, y);
      y += 12;
      const chips = keywords.map(k => `${k.label}`).join('  •  ');
      doc.fillColor('#6b7280').fontSize(7.5).font('Helvetica').text(chips, BL, y, { width: W });
      y += 20;
    }

    // ── Terms ───────────────────────────────────────────────
    if (y > 680) { doc.addPage(); y = 50; }
    doc.moveTo(BL, y).lineTo(BL + W, y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    y += 8;
    doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica')
       .text('Terms: This quotation is valid for 30 days. Payment terms: 50% advance, 50% on delivery. ' +
             'Prices exclude out-of-scope work. Any change requests will be evaluated separately. ' +
             'BPQG reserves the right to revise the quotation if requirements change significantly.',
             BL, y, { width: W });

    // ── Footer ──────────────────────────────────────────────
    const pageHeight = doc.page.height;
    doc.rect(0, pageHeight - 40, doc.page.width, 40).fill('#1e3a5f');
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
       .text('BPQG — Business Proposal & Quotation Generator  |  Confidential Document',
             BL, pageHeight - 26, { width: doc.page.width - 100, align: 'center' });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
