const router = require('express').Router();
const db = require('../database');
const requireAuth = require('../middleware/auth');

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC LIMIT 50').all(req.user.id);
  res.json(notifs.map(n => ({ ...n, read: !!n.read })));
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?').run(req.user.id);
  res.json({ success: true });
});

module.exports = router;
