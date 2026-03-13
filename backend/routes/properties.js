const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function parseProperty(p) {
  if (!p) return null;
  return {
    ...p,
    amenities: JSON.parse(p.amenities || '[]'),
    rules: JSON.parse(p.rules || '[]'),
    photos: JSON.parse(p.photos || '[]'),
    verified: !!p.verified,
    available: !!p.available
  };
}

// GET /api/properties
router.get('/', (req, res) => {
  const { location, type, minPrice, maxPrice, gender, search } = req.query;
  let query = 'SELECT * FROM properties WHERE 1=1';
  const params = [];
  if (location) { query += ' AND location LIKE ?'; params.push(`%${location}%`); }
  if (type)     { query += ' AND type = ?'; params.push(type); }
  if (gender && gender !== 'Any') { query += ' AND (genderPreference = ? OR genderPreference = "Any")'; params.push(gender); }
  if (minPrice) { query += ' AND price >= ?'; params.push(Number(minPrice)); }
  if (maxPrice) { query += ' AND price <= ?'; params.push(Number(maxPrice)); }
  if (search)   { query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  query += ' ORDER BY rating DESC';
  const rows = db.prepare(query).all(...params).map(parseProperty);
  res.json(rows);
});

// GET /api/properties/:id
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Property not found' });
  const landlord = db.prepare('SELECT id, fullName, avatar, photo, verificationBadge, role FROM users WHERE id = ?').get(p.landlordId);
  res.json({ ...parseProperty(p), landlord });
});

// POST /api/properties — Landlord creates listing
router.post('/', requireAuth, upload.array('photos', 5), (req, res) => {
  if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only landlords can create listings' });
  }
  const { title, address, location, price, capacity, availableSlots, type, description, amenities, rules, genderPreference, distanceFromUni } = req.body;
  const uploadedPhotos = (req.files || []).map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
  const id = 'p_' + uuid().replace(/-/g, '').slice(0, 12);
  db.prepare(`
    INSERT INTO properties (id, title, address, location, price, capacity, availableSlots, type,
      description, amenities, rules, photos, landlordId, rating, reviews, verified,
      genderPreference, distanceFromUni, available, createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,?,?,1,?)
  `).run(id, title, address, location, Number(price), Number(capacity), Number(availableSlots), type,
    description, JSON.stringify(amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a=>a.trim())) : []),
    JSON.stringify(rules ? (Array.isArray(rules) ? rules : rules.split(',').map(r=>r.trim())) : []),
    JSON.stringify(uploadedPhotos), req.user.id,
    genderPreference || 'Any', distanceFromUni || 'N/A', new Date().toISOString().split('T')[0]);
  res.status(201).json({ success: true, id });
});

// PUT /api/properties/:id — Landlord or Admin updates listing
router.put('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && p.landlordId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const { title, address, location, price, capacity, availableSlots, type, description, genderPreference, verified } = req.body;
  db.prepare(`UPDATE properties SET title=COALESCE(?,title), address=COALESCE(?,address),
    location=COALESCE(?,location), price=COALESCE(?,price), capacity=COALESCE(?,capacity),
    availableSlots=COALESCE(?,availableSlots), type=COALESCE(?,type),
    description=COALESCE(?,description), genderPreference=COALESCE(?,genderPreference),
    verified=COALESCE(?,verified), available=CASE WHEN COALESCE(?,availableSlots)>0 THEN 1 ELSE 0 END WHERE id=?`)
    .run(title||null, address||null, location||null, price||null, capacity||null, availableSlots||null, type||null, description||null, genderPreference||null, verified!==undefined?Number(verified):null, availableSlots||null, req.params.id);
  res.json(parseProperty(db.prepare('SELECT * FROM properties WHERE id=?').get(req.params.id)));
});

// DELETE /api/properties/:id — Admin or landlord
router.delete('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && p.landlordId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/properties/:id/photos — Upload additional photos
router.post('/:id/photos', requireAuth, upload.array('photos', 5), (req, res) => {
  const p = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!p || (req.user.role !== 'admin' && p.landlordId !== req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  const existing = JSON.parse(p.photos || '[]');
  const newPhotos = (req.files || []).map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
  const all = [...existing, ...newPhotos];
  db.prepare('UPDATE properties SET photos = ? WHERE id = ?').run(JSON.stringify(all), req.params.id);
  res.json({ photos: all });
});

module.exports = router;
