const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Central Configuration for FlowCraft Application
 *
 * This file contains all global configuration settings.
 * All configuration values should be loaded from environment variables (.env file).
 *
 * IMPORTANT: Never hardcode sensitive values like database hosts, passwords, or API keys directly in the code.
 */

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 8002,
    host: process.env.HOST || 'localhost',
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    // Connection pool settings
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) || 20000,
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT, 10) || 20000,
    }
  },

  // Authentication & Security
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-characters-long',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // VPS/Domain Configuration
  domain: {
    vps: process.env.VPS_DOMAIN || 'localhost',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    backend: process.env.BACKEND_URL || 'http://localhost:8002',
  },

  // N8N Configuration
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678/api/v1',
    webhookBase: process.env.N8N_WEBHOOK_BASE || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || '',
  },

  // External Services (optional)
  services: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    },
  },

  // Application Settings
  app: {
    name: 'FlowCraft',
    version: '1.0.0',
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};

// Validation - check for required configuration values
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');

  if (config.isProduction) {
    process.exit(1);
  }
}

// Helper function to mask sensitive values in logs
config.getSafeConfig = () => {
  const maskValue = (value) => {
    if (!value) return '[NOT SET]';
    if (value.length <= 4) return '***';
    return value.substring(0, 3) + '***' + value.substring(value.length - 2);
  };

  return {
    env: config.env,
    server: config.server,
    database: {
      host: config.database.host,
      port: config.database.port,
      name: config.database.name,
      user: config.database.user,
      password: maskValue(config.database.password),
      ssl: config.database.ssl,
    },
    auth: {
      jwtSecret: maskValue(config.auth.jwtSecret),
      jwtExpiresIn: config.auth.jwtExpiresIn,
    },
    domain: config.domain,
    n8n: {
      baseUrl: config.n8n.baseUrl,
      webhookBase: config.n8n.webhookBase,
      apiKey: maskValue(config.n8n.apiKey),
    },
    app: config.app,
  };
};

module.exports = config;
