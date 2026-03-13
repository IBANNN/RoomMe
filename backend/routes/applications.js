const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

// GET /api/applications
router.get('/', requireAuth, (req, res) => {
  let apps;
  if (req.user.role === 'tenant') {
    apps = db.prepare('SELECT * FROM applications WHERE tenantId = ? ORDER BY submittedAt DESC').all(req.user.id);
  } else if (req.user.role === 'landlord') {
    apps = db.prepare(`
      SELECT a.* FROM applications a
      JOIN properties p ON a.propertyId = p.id
      WHERE p.landlordId = ? ORDER BY a.submittedAt DESC`).all(req.user.id);
  } else {
    apps = db.prepare('SELECT * FROM applications ORDER BY submittedAt DESC').all();
  }

  const enriched = apps.map(a => {
    const tenant = db.prepare('SELECT id, fullName, avatar, photo, university, yearLevel, verificationBadge FROM users WHERE id = ?').get(a.tenantId);
    const property = db.prepare('SELECT id, title, address, type, price FROM properties WHERE id = ?').get(a.propertyId);
    return { ...a, tenant, property };
  });
  res.json(enriched);
});

// POST /api/applications
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'tenant') return res.status(403).json({ error: 'Only tenants can apply' });
  const { propertyId, message } = req.body;
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const existing = db.prepare('SELECT id FROM applications WHERE tenantId = ? AND propertyId = ?').get(req.user.id, propertyId);
  if (existing) return res.status(409).json({ error: 'You already applied for this property' });

  const id = 'app_' + uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO applications VALUES (?,?,?,?,?,?,?,?)').run(
    id, req.user.id, propertyId, property.landlordId, 'Pending', message || '', now, now);

  // Notify landlord
  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), property.landlordId, 'application', '📋', 'rgba(99,102,241,0.1)',
    'New Application', `${req.user.fullName} applied for "${property.title}".`,
    '/applications', 0, now);

  res.status(201).json({ success: true, id });
});

// PUT /api/applications/:id — Landlord or Admin updates status
router.put('/:id', requireAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Not found' });

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(app.propertyId);
  if (req.user.role !== 'admin' && property.landlordId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { status } = req.body;
  const now = new Date().toISOString();
  db.prepare('UPDATE applications SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, req.params.id);

  // If approved, decrement available slots and generate initial payments
  if (status === 'Approved') {
    db.prepare('UPDATE properties SET availableSlots = MAX(0, availableSlots - 1) WHERE id = ?').run(app.propertyId);
    db.prepare('UPDATE properties SET available = CASE WHEN availableSlots > 0 THEN 1 ELSE 0 END WHERE id = ?').run(app.propertyId);

    // Generate Move-in Costs (2 months deposit, 1 month advance)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
    const dueStr = dueDate.toISOString().split('T')[0];
    
    // 1 Month Advance
    db.prepare('INSERT INTO payments (id, tenantId, landlordId, propertyId, amount, month, dueDate, status) VALUES (?,?,?,?,?,?,?,?)').run(
      'pay_' + uuid(), app.tenantId, property.landlordId, app.propertyId, property.price, '1st Month Advance', dueStr, 'Pending'
    );
    // Security Deposit - Month 1
    db.prepare('INSERT INTO payments (id, tenantId, landlordId, propertyId, amount, month, dueDate, status) VALUES (?,?,?,?,?,?,?,?)').run(
      'pay_' + uuid(), app.tenantId, property.landlordId, app.propertyId, property.price, 'Security Deposit (Pt 1)', dueStr, 'Pending'
    );
    // Security Deposit - Month 2
    db.prepare('INSERT INTO payments (id, tenantId, landlordId, propertyId, amount, month, dueDate, status) VALUES (?,?,?,?,?,?,?,?)').run(
      'pay_' + uuid(), app.tenantId, property.landlordId, app.propertyId, property.price, 'Security Deposit (Pt 2)', dueStr, 'Pending'
    );
  }

  // Notify tenant
  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), app.tenantId, 'application',
    status === 'Approved' ? '✅' : '❌',
    status === 'Approved' ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)',
    `Application ${status}`,
    `Your application for "${property.title}" has been ${status.toLowerCase()}.`,
    '/applications', 0, now);

  res.json({ success: true });
});

// DELETE /api/applications/:id — Tenant withdraws
router.delete('/:id', requireAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app || app.tenantId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
