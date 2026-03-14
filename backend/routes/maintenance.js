const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/maintenance
router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.user.role === 'tenant') {
    rows = db.prepare('SELECT * FROM maintenance WHERE tenantId = ? ORDER BY createdAt DESC').all(req.user.id);
  } else if (req.user.role === 'landlord') {
    const myProps = db.prepare('SELECT id FROM properties WHERE landlordId = ?').all(req.user.id).map(p => p.id);
    if (!myProps.length) return res.json([]);
    const placeholders = myProps.map(() => '?').join(',');
    rows = db.prepare(`SELECT * FROM maintenance WHERE propertyId IN (${placeholders}) ORDER BY createdAt DESC`).all(...myProps);
  } else {
    rows = db.prepare('SELECT * FROM maintenance ORDER BY createdAt DESC').all();
  }
  const enriched = rows.map(r => ({
    ...r,
    photos: JSON.parse(r.photos || '[]'),
    timeline: JSON.parse(r.timeline || '[]')
  }));
  res.json(enriched);
});

// POST /api/maintenance — Tenant creates request
router.post('/', requireAuth, upload.array('photos', 4), (req, res) => {
  if (req.user.role !== 'tenant') return res.status(403).json({ error: 'Only tenants can submit requests' });
  const { propertyId, category, title, description, priority } = req.body;
  const photoUrls = (req.files || []).map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
  const id = 'maint_' + uuid();
  const now = new Date().toISOString();
  const timeline = JSON.stringify([{ action: 'Submitted', by: req.user.fullName, date: now.split('T')[0], note: description }]);

  db.prepare(`INSERT INTO maintenance VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, req.user.id, propertyId, category, title, description, priority || 'Medium',
    'Pending', JSON.stringify(photoUrls), timeline, now, now);

  // Notify landlord
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  if (property) {
    db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      'n_' + uuid(), property.landlordId, 'maintenance', '🔧', 'rgba(56,189,248,0.1)',
      'New Maintenance Request', `${req.user.fullName} submitted: "${title}"`, '/maintenance', 0, now);
  }
  res.status(201).json({ success: true, id });
});

// PUT /api/maintenance/:id — Landlord/Admin updates status
router.put('/:id', requireAuth, (req, res) => {
  const req_item = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);
  if (!req_item) return res.status(404).json({ error: 'Not found' });
  const { status, note } = req.body;
  const now = new Date().toISOString();

  const timeline = JSON.parse(req_item.timeline || '[]');
  if (status) {
    const actionMap = { 'In Progress': 'Started', 'Completed': 'Resolved', 'Pending': 'Reopened' };
    timeline.push({ action: actionMap[status] || status, by: req.user.fullName, date: now.split('T')[0], note: note || '' });
  }

  db.prepare('UPDATE maintenance SET status=COALESCE(?,status), timeline=?, updatedAt=? WHERE id=?')
    .run(status || null, JSON.stringify(timeline), now, req.params.id);

  // Notify tenant
  if (status) {
    db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      'n_' + uuid(), req_item.tenantId, 'maintenance', '🔧', 'rgba(56,189,248,0.1)',
      'Maintenance Update', `Your request "${req_item.title}" is now: ${status}.`,
      '/maintenance', 0, now);
  }

  const updated = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);
  res.json({ ...updated, photos: JSON.parse(updated.photos || '[]'), timeline: JSON.parse(updated.timeline || '[]') });
});

// PUT /api/maintenance/:id/photos — Tenant or Landlord adds update photos
router.put('/:id/photos', requireAuth, upload.array('photos', 4), (req, res) => {
  const item = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const existing = JSON.parse(item.photos || '[]');
  const newPhotos = (req.files || []).map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
  const all = [...existing, ...newPhotos];
  const now = new Date().toISOString();

  db.prepare('UPDATE maintenance SET photos = ?, updatedAt = ? WHERE id = ?').run(JSON.stringify(all), now, req.params.id);
  res.json({ success: true, photos: all });
});

module.exports = router;
