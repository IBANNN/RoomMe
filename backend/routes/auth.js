const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('../database');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { fullName, email, password, role, phone, university, yearLevel } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  const id = 'u_' + uuid().replace(/-/g, '').slice(0, 12);
  const avatar = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const passwordHash = bcrypt.hashSync(password, 10);
  const lifestyle = role === 'tenant'
    ? JSON.stringify({ sleepSchedule: 'Flexible', cleanliness: 'Moderate', studyHabits: 'Room Studier', noiseTolerance: 'Moderate', genderPreference: 'Any' })
    : '{}';

  db.prepare(`
    INSERT INTO users (id, fullName, email, phone, passwordHash, role, avatar, photo, university, yearLevel, lifestyle, verified, emailVerified, verificationBadge, idVerified, otp, otpExpiry, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?)
  `).run(id, fullName, email, phone || null, passwordHash, role, avatar, null, university || null, yearLevel || null, lifestyle, otp, otpExpiry, new Date().toISOString().split('T')[0]);

  // In production, send an email. In dev, log to console.
  console.log(`\n📧 OTP for ${email}: ${otp}\n`);

  res.json({ success: true, message: 'OTP sent to your email', email, otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
});

// POST /api/auth/verify-email
router.post('/verify-email', (req, res) => {
  const { email, otp } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date(user.otpExpiry) < new Date()) return res.status(400).json({ error: 'OTP expired. Please register again.' });

  db.prepare('UPDATE users SET emailVerified = 1, otp = NULL, otpExpiry = NULL WHERE id = ?').run(user.id);

  // Notify admin of new user
  db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'n_' + uuid(), 'u5', 'system', '👤', 'rgba(99,102,241,0.1)',
    'New User Registered', `${user.fullName} (${user.role}) just verified their account.`,
    '/dashboard', 0, new Date().toISOString()
  );

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const safe = sanitizeUser(user);
  safe.emailVerified = true;

  res.json({ success: true, token, user: safe });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email first', requiresVerification: true, email });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: sanitizeUser(user) });
});

// POST /api/auth/resend-otp
router.post('/resend-otp', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET otp = ?, otpExpiry = ? WHERE id = ?').run(otp, otpExpiry, user.id);
  console.log(`\n📧 Resent OTP for ${email}: ${otp}\n`);
  res.json({ success: true, otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
});

function sanitizeUser(u) {
  const { passwordHash, otp, otpExpiry, ...safe } = u;
  if (safe.lifestyle) safe.lifestyle = JSON.parse(safe.lifestyle || '{}');
  safe.verified = !!safe.verified;
  safe.emailVerified = !!safe.emailVerified;
  safe.verificationBadge = !!safe.verificationBadge;
  safe.idVerified = !!safe.idVerified;
  return safe;
}

module.exports = router;
