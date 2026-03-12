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

router.get('/conversations', requireAuth, (req, res) => {
  const convs = db.prepare(`
    SELECT * FROM conversations
    WHERE user1Id = ? OR user2Id = ?
    ORDER BY lastAt DESC
  `).all(req.user.id, req.user.id);

  const enriched = convs.map(c => {
    const messages = db.prepare(`
      SELECT id, senderId, content as text, attachmentUrl, sentAt as timestamp
      FROM messages
      WHERE conversationId = ?
      ORDER BY sentAt ASC
    `).all(c.id);

    // If there are no messages, create a dummy one based on lastMessage
    return { 
      id: c.id, 
      participants: [c.user1Id, c.user2Id],
      messages: messages.length ? messages : [{
        id: 'mock',
        senderId: c.user1Id,
        text: c.lastMessage || 'Conversation started',
        timestamp: c.lastAt
      }]
    };
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
