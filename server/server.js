require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const connectDB       = require('./config/db');
const logger          = require('./utils/logger');
const errorMiddleware = require('./middleware/error.middleware');

// Routes — no auth middleware anywhere
const authRoutes    = require('./routes/auth.routes');
const countryRoutes = require('./routes/country.routes');
const riskRoutes    = require('./routes/risk.routes');
const compareRoutes = require('./routes/compare.routes');
const alertRoutes   = require('./routes/alert.routes');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Rate Limiting (gentle, no auth tiers) ────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// ── Static Client Files ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client')));

// ── API Routes (all open, no auth required) ───────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/risk',      riskRoutes);
app.use('/api/compare',   compareRoutes);
app.use('/api/alerts',    alertRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'operational', system: 'GSS-CFS', timestamp: new Date().toISOString() });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  }
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 GSS-CFS running on http://localhost:${PORT}`);
});

module.exports = app;
