require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'roomme_fallback_secret_key_12345';
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve frontend static files from project root
app.use(express.static(path.join(__dirname, '..')));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/properties',    require('./routes/properties'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/maintenance',   require('./routes/maintenance'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites',     require('./routes/favorites'));

// ─── Catch-all: serve index.html for SPA routing ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 RoomMe server running at http://localhost:${PORT}`);
});
