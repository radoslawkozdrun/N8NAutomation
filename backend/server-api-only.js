const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { testConnection } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for React
}));
app.use(compression());

// CORS configuration for local development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Routes - API only, no static files
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/articles'));
app.use('/api', require('./routes/dashboard'));
app.use('/api', require('./routes/feeds'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: 'API_ONLY',
      services: {
        database: 'ok',
        ai_service: 'ok',
        rss_feeds: 'ok'
      }
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'RSS Review API Server - API Only Mode',
    version: '1.0.0',
    mode: 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      articles: '/api/articles',
      dashboard: '/api/dashboard',
      posts: '/api/posts',
      feeds: '/api/feeds'
    }
  });
});

// 404 handler for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'This server only provides API endpoints. Frontend should be served separately.',
      suggestion: 'Run frontend dev server on port 3000'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    await testConnection();
    
    app.listen(PORT, () => {
      console.log('\n🚀 RSS Review API Server (API Only) running');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
      console.log(`🎯 Mode: API_ONLY (no static files)`);
      console.log(`🌐 CORS: Allowing localhost:3000, localhost:5173`);
      console.log('\n💡 Start frontend separately: npm run dev');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();