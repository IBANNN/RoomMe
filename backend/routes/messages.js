const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('../database');
const requireAuth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET /api/messages/conversations
router.get('/conversations', requireAuth, (req, res) => {
  const convs = db.prepare(`
    SELECT c.*, 
      u1.id as u1id, u1.fullName as u1name, u1.avatar as u1avatar, u1.photo as u1photo,
      u2.id as u2id, u2.fullName as u2name, u2.avatar as u2avatar, u2.photo as u2photo
    FROM conversations c
    JOIN users u1 ON c.user1Id = u1.id
    JOIN users u2 ON c.user2Id = u2.id
    WHERE c.user1Id = ? OR c.user2Id = ?
    ORDER BY c.lastAt DESC
  `).all(req.user.id, req.user.id);

  const enriched = convs.map(c => {
    const other = c.u1id === req.user.id ? { id: c.u2id, fullName: c.u2name, avatar: c.u2avatar, photo: c.u2photo } : { id: c.u1id, fullName: c.u1name, avatar: c.u1avatar, photo: c.u1photo };
    return { id: c.id, lastMessage: c.lastMessage, lastAt: c.lastAt, createdAt: c.createdAt, otherUser: other };
  });
  res.json(enriched);
});

// GET /api/messages/:conversationId
router.get('/:conversationId', requireAuth, (req, res) => {
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.conversationId);
  if (!conv || (conv.user1Id !== req.user.id && conv.user2Id !== req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const messages = db.prepare(`
    SELECT m.*, u.fullName as senderName, u.avatar as senderAvatar, u.photo as senderPhoto
    FROM messages m JOIN users u ON m.senderId = u.id
    WHERE m.conversationId = ? ORDER BY m.sentAt ASC
  `).all(req.params.conversationId);
  res.json(messages);
});

// POST /api/messages/conversations — Start or get existing conversation
router.post('/conversations', requireAuth, (req, res) => {
  const { otherUserId } = req.body;
  const existing = db.prepare(`
    SELECT * FROM conversations
    WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)
  `).get(req.user.id, otherUserId, otherUserId, req.user.id);

  if (existing) return res.json({ conversationId: existing.id });

  const id = 'conv_' + uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO conversations VALUES (?,?,?,?,?,?)').run(id, req.user.id, otherUserId, null, now, now);
  res.status(201).json({ conversationId: id });
});

// POST /api/messages/:conversationId — Send a message
router.post('/:conversationId', requireAuth, upload.single('attachment'), (req, res) => {
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.conversationId);
  if (!conv || (conv.user1Id !== req.user.id && conv.user2Id !== req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { content } = req.body;
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const id = 'msg_' + uuid();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO messages VALUES (?,?,?,?,?,?,?)').run(
    id, req.params.conversationId, req.user.id, content || null,
    attachmentUrl, attachmentUrl ? 'file' : 'text', now);

  db.prepare('UPDATE conversations SET lastMessage = ?, lastAt = ? WHERE id = ?')
    .run(content || '📎 Attachment', now, req.params.conversationId);

  res.status(201).json({ success: true, id, attachmentUrl });
});

module.exports = router;
