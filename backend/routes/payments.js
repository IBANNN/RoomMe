const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/payments
router.get('/', requireAuth, (req, res) => {
  let payments;
  if (req.user.role === 'tenant') {
    payments = db.prepare('SELECT * FROM payments WHERE tenantId = ? ORDER BY createdAt DESC').all(req.user.id);
  } else if (req.user.role === 'landlord') {
    payments = db.prepare('SELECT * FROM payments WHERE landlordId = ? ORDER BY createdAt DESC').all(req.user.id);
  } else {
    payments = db.prepare('SELECT * FROM payments ORDER BY createdAt DESC').all();
  }

  // Deduplicate on the backend to permanently suppress ghost duplicate records
  const statusRank = { 'Paid': 3, 'Pending Verification': 2, 'Overdue': 1, 'Pending': 0, 'Rejected': -1 };
  const seen = new Map();
  payments.forEach(p => {
    const key = `${p.tenantId}|${p.propertyId}|${p.month}`;
    const existing = seen.get(key);
    if (!existing || (statusRank[p.status] ?? 0) > (statusRank[existing.status] ?? 0)) {
      seen.set(key, p);
    }
  });
  payments = Array.from(seen.values());
  const enriched = payments.map(p => {
    const tenant = db.prepare('SELECT id, fullName, avatar, photo FROM users WHERE id = ?').get(p.tenantId);
    const property = db.prepare('SELECT id, title FROM properties WHERE id = ?').get(p.propertyId);
    return { ...p, tenant, property };
  });
  res.json(enriched);
});

// POST /api/payments — Tenant submits payment with proof
router.post('/', requireAuth, upload.single('proof'), (req, res) => {
  if (req.user.role !== 'tenant') return res.status(403).json({ error: 'Only tenants can submit payments' });
  const { propertyId, amount, month, dueDate, method, receiptNo } = req.body;
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const proofUrl = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;
  const id = 'pay_' + uuid();
  const now = new Date().toISOString();

  db.prepare(`INSERT INTO payments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, req.user.id, propertyId, property.landlordId,
    Number(amount), month, dueDate || null, null,
    'Pending Verification', method, receiptNo || null, proofUrl, now);

  // Notify landlord and admin
  const notifMsg = `${req.user.fullName} submitted payment of ₱${Number(amount).toLocaleString()} for ${month}.`;
  [property.landlordId, 'u5'].forEach(uid => {
    db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      'n_' + uuid(), uid, 'payment', '💳', 'rgba(99,102,241,0.1)',
      'Payment Submitted', notifMsg, '/payments', 0, now);
  });

  res.status(201).json({ success: true, id, proofUrl });
});

// PUT /api/payments/:id/submit — Tenant updates existing payment with proof (no duplicate created)
router.put('/:id/submit', requireAuth, upload.single('proof'), (req, res) => {
  if (req.user.role !== 'tenant') return res.status(403).json({ error: 'Only tenants can submit payments' });
  const pay = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!pay) return res.status(404).json({ error: 'Not found' });
  if (pay.tenantId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const proofUrl = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : pay.proofUrl;
  const method = req.body.method || pay.method;
  const now = new Date().toISOString();

  db.prepare('UPDATE payments SET status = ?, proofUrl = ?, method = ? WHERE id = ?')
    .run('Pending Verification', proofUrl, method, req.params.id);

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(pay.propertyId);
  const notifMsg = `${req.user.fullName} submitted proof for ₱${pay.amount.toLocaleString()} (${pay.month}).`;
  [pay.landlordId, 'u5'].forEach(uid => {
    db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      'n_' + uuid(), uid, 'payment', '💳', 'rgba(99,102,241,0.1)',
      'Payment Submitted', notifMsg, '/payments', 0, now);
  });

  res.json({ success: true, proofUrl });
});

// PUT /api/payments/:id/approve — Admin or Landlord
router.put('/:id/approve', requireAuth, (req, res) => {
  if (!['admin', 'landlord'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const pay = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!pay) return res.status(404).json({ error: 'Not found' });

  const now = new Date().toISOString();
  db.prepare('UPDATE payments SET status = ?, paidDate = ?, receiptNo = COALESCE(receiptNo, ?) WHERE id = ?')
    .run('Paid', now.split('T')[0], 'RCV-' + Date.now(), req.params.id);

  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), pay.tenantId, 'payment', '✅', 'rgba(0,212,170,0.1)',
    'Payment Approved!', `Your payment of ₱${pay.amount.toLocaleString()} for ${pay.month} has been approved.`,
    '/payments', 0, now);

  res.json({ success: true });
});

// PUT /api/payments/:id/reject — Admin or Landlord
router.put('/:id/reject', requireAuth, (req, res) => {
  if (!['admin', 'landlord'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const pay = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!pay) return res.status(404).json({ error: 'Not found' });

  db.prepare('UPDATE payments SET status = ? WHERE id = ?').run('Rejected', req.params.id);

  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), pay.tenantId, 'payment', '❌', 'rgba(255,107,107,0.1)',
    'Payment Rejected', `Your payment for ${pay.month} was rejected. Please re-submit with a clear receipt.`,
    '/payments', 0, new Date().toISOString());

  res.json({ success: true });
});

module.exports = router;
