const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

function parseProperty(p) {
  if (!p) return null;
  return { ...p, amenities: JSON.parse(p.amenities || '[]'), rules: JSON.parse(p.rules || '[]'), photos: JSON.parse(p.photos || '[]'), verified: !!p.verified, available: !!p.available };
}

// GET /api/favorites
router.get('/', requireAuth, (req, res) => {
  const favs = db.prepare(`
    SELECT f.*, p.* FROM favorites f
    JOIN properties p ON f.propertyId = p.id
    WHERE f.userId = ?
  `).all(req.user.id);
  res.json(favs.map(f => parseProperty(f)));
});

// POST /api/favorites/toggle
router.post('/toggle', requireAuth, (req, res) => {
  const { propertyId } = req.body;
  const existing = db.prepare('SELECT id FROM favorites WHERE userId = ? AND propertyId = ?').get(req.user.id, propertyId);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE userId = ? AND propertyId = ?').run(req.user.id, propertyId);
    res.json({ favorited: false });
  } else {
    db.prepare('INSERT OR IGNORE INTO favorites VALUES (?,?,?,?)').run('fav_' + uuid(), req.user.id, propertyId, new Date().toISOString());
    res.json({ favorited: true });
  }
});

// GET /api/favorites/check/:propertyId
router.get('/check/:propertyId', requireAuth, (req, res) => {
  const exists = db.prepare('SELECT id FROM favorites WHERE userId = ? AND propertyId = ?').get(req.user.id, req.params.propertyId);
  res.json({ favorited: !!exists });
});

module.exports = router;
