const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function sanitizeUser(u) {
  const { passwordHash, otp, otpExpiry, ...safe } = u;
  if (safe.lifestyle) safe.lifestyle = JSON.parse(safe.lifestyle || '{}');
  safe.verified = !!safe.verified;
  safe.emailVerified = !!safe.emailVerified;
  safe.verificationBadge = !!safe.verificationBadge;
  safe.idVerified = !!safe.idVerified;
  return safe;
}

// GET /api/users/me
router.get('/me', requireAuth, (req, res) => {
  res.json(sanitizeUser(req.user));
});

// PUT /api/users/me
router.put('/me', requireAuth, (req, res) => {
  const { fullName, email, phone, university, yearLevel, lifestyle } = req.body;
  const avatar = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : req.user.avatar;
  db.prepare(`UPDATE users SET fullName=COALESCE(?,fullName), email=COALESCE(?,email), phone=COALESCE(?,phone),
    university=COALESCE(?,university), yearLevel=COALESCE(?,yearLevel), lifestyle=COALESCE(?,lifestyle), avatar=? WHERE id=?`)
    .run(fullName || null, email || null, phone || null, university || null, yearLevel || null,
      lifestyle ? JSON.stringify(lifestyle) : null, avatar, req.user.id);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json(sanitizeUser(updated));
});

// POST /api/users/me/photo
router.post('/me/photo', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(url, req.user.id);
  res.json({ success: true, photo: url });
});

// POST /api/users/me/documents
router.post('/me/documents', requireAuth, upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { type } = req.body;
  const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const docId = 'doc_' + uuid();
  db.prepare('INSERT INTO documents VALUES (?,?,?,?,?,?)').run(docId, req.user.id, type || 'general', url, req.file.originalname, new Date().toISOString());
  // Notify admin
  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), 'u5', 'verification', '📄', 'rgba(245,158,11,0.1)',
    'Document Submitted', `${req.user.fullName} submitted ${type || 'a document'} for verification.`,
    '/dashboard', 0, new Date().toISOString()
  );
  res.json({ success: true, url, type });
});

// GET /api/users/:id/documents — Admin only
router.get('/:id/documents', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const docs = db.prepare('SELECT * FROM documents WHERE userId = ?').all(req.params.id);
  res.json(docs);
});

// GET /api/users — All authenticated users can see the user list
router.get('/', requireAuth, (req, res) => {
  const users = db.prepare('SELECT * FROM users').all().map(sanitizeUser);
  res.json(users);
});

// PUT /api/users/:id/verify — Admin only
router.put('/:id/verify', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE users SET verified=1, verificationBadge=1, emailVerified=1 WHERE id=?').run(req.params.id);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  // Notify user
  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), req.params.id, 'verification', '✅', 'rgba(0,212,170,0.1)',
    'Account Verified!', 'Your account has been verified by admin. All features are now unlocked.',
    '/dashboard', 0, new Date().toISOString()
  );
  res.json(sanitizeUser(user));
});

// DELETE /api/users/:id — Admin only
router.delete('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PUT /api/users/:id/change-password
router.put('/:id/change-password', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const { currentPassword, newPassword } = req.body;
  const bcrypt = require('bcryptjs');
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password too short' });
  db.prepare('UPDATE users SET passwordHash=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), req.params.id);
  res.json({ success: true });
});

// GET /api/users/roommates — tenant matching pool
router.get('/roommates', requireAuth, (req, res) => {
  const tenants = db.prepare(`SELECT * FROM users WHERE role='tenant' AND id != ?`).all(req.user.id).map(sanitizeUser);
  res.json(tenants);
});

module.exports = router;
