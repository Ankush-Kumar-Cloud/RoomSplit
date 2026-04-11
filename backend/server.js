require('dotenv').config();

console.log("MONGO_URI:", process.env.MONGO_URI);
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const connectDB  = require('./config/db');

// Route imports
const authRoutes    = require('./routes/auth');
const groupRoutes   = require('./routes/groups');
const groupSubRoutes = require('./routes/expenses'); // handles expenses/budgets/settlements

const app = express();

/* ── Connect to MongoDB ── */
connectDB();

/* ── Global Middleware ── */
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ── Health check ── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

/* ── Routes ── */
app.use('/api/auth',          authRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/groups/:groupId', groupSubRoutes); // nested: /api/groups/:groupId/expenses …

/* ── 404 handler ── */
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 RoomSplit API running on http://localhost:${PORT}`)
);
