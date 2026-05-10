const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests. Please try again later.' } });
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'NEEV Backend', timestamp: new Date().toISOString() }));

// Start server then connect DB
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Try connecting to MongoDB
  await connectDB();
  
  const { isConnected } = require('./config/db');
  
  if (isConnected()) {
    // Real routes with database
    console.log('📦 Loading database-backed routes...');
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/students', require('./routes/students'));
    app.use('/api/teacher', require('./routes/teachers'));
    app.use('/api/academics', require('./routes/academics'));
    app.use('/api/skills', require('./routes/skills'));
    app.use('/api/roadmap', require('./routes/roadmap'));
    app.use('/api/projects', require('./routes/projects'));
    app.use('/api/planner', require('./routes/planner'));
    app.use('/api/placement', require('./routes/placement'));
    app.use('/api/saarthi', require('./routes/saarthi'));
    app.use('/api/notifications', require('./routes/notifications'));
    app.use('/api/reports', require('./routes/reports'));
    app.use('/api/feedback', require('./routes/feedback'));
    app.use('/api/checkin', require('./routes/checkin'));
  } else {
    // Demo routes with mock data
    console.log('🎮 Loading DEMO routes with mock data...');
    app.use('/api', require('./routes/demo'));
  }

  // 404 handler
  app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ error: 'Internal server error.' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 NEEV Backend running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
