const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8002;

console.log('🔧 Starting in DEVELOPMENT mode - database checks disabled');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for React
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../dist')));

// Mock routes for development
app.use('/api/posts', (req, res) => {
  res.json({ success: true, data: [], message: 'Development mode - no database' });
});

app.use('/api/auth', (req, res) => {
  res.json({ success: true, data: { user: { id: 1, username: 'dev' } }, message: 'Development mode' });
});

app.use('/api/articles', (req, res) => {
  res.json({ success: true, data: [], message: 'Development mode - no database' });
});

app.use('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        total_articles: 0,
        pending_review: 0,
        approved: 0,
        rejected: 0
      }
    },
    message: 'Development mode'
  });
});

app.use('/api/feeds', (req, res) => {
  res.json({ success: true, data: [], message: 'Development mode - no database' });
});

// Health check endpoint (always works)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: 'development',
      services: {
        database: 'disabled',
        ai_service: 'disabled',
        rss_feeds: 'disabled'
      }
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'RSS Review API Server - Development Mode',
    version: '1.0.0',
    mode: 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      articles: '/api/articles',
      dashboard: '/api/dashboard'
    }
  });
});

// Catch all handler for React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    });
  }

  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server (no database check)
app.listen(PORT, () => {
  console.log(`🚀 RSS Review API Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🎨 Frontend: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Shutting down server...');
  process.exit(0);
});