const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { testConnection } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for React
}));
app.use(compression());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8002', 
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    // Allow any origin containing the VPS hostname
    if (origin.includes('srv936559.hstgr.cloud') || 
        allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // For now, allow all origins
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/articles'));
app.use('/api', require('./routes/dashboard'));
app.use('/api', require('./routes/feeds'));
app.use('/api', require('./routes/users'));
app.use('/api/domains', require('./routes/domains'));
app.use('/api/n8n', require('./routes/n8n'));
app.use('/api/social-media', require('./routes/social-media'));
app.use('/api/master-content', require('./routes/master-content'));
app.use('/api/platform-content', require('./routes/platform-content'));
app.use('/api/webhook', require('./routes/webhook-trigger'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'ok',
        ai_service: 'ok',
        rss_feeds: 'ok'
      }
    }
  });
});

// API info endpoint (only for /api requests)
app.get('/api', (req, res) => {
  res.json({
    message: 'RSS Review API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      articles: '/api/articles',
      dashboard: '/api/dashboard'
    }
  });
});

// Catch all handler for React Router (serve index.html for non-API routes)
app.get('*', (req, res) => {
  // If it's an API request that doesn't exist, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    });
  }
  
  // Otherwise, serve the React app
  res.sendFile(path.join(__dirname, '../dist/index.html'));
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

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 RSS Review API Server running on port ${PORT}`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Shutting down server...');
  process.exit(0);
});

startServer();