# FlowCraft Configuration Guide

This document describes the centralized configuration system for FlowCraft application.

## Overview

FlowCraft uses a centralized configuration system to manage all global settings. This approach ensures:

- **Single Source of Truth**: All configuration is defined in one place
- **No Hardcoded Values**: Database hosts, API URLs, and other settings are never hardcoded in the code
- **Environment-Based**: Easy switching between development, staging, and production environments
- **Type Safety**: Frontend configuration is fully typed with TypeScript

## Configuration Structure

### Backend Configuration

**Location**: `backend/src/config/index.js`

This file exports a single `config` object containing all backend settings:

```javascript
const config = require('./config');

// Usage examples:
console.log(config.database.host);        // Database host
console.log(config.n8n.baseUrl);          // N8N base URL
console.log(config.server.port);          // Server port
```

#### Available Settings:

- **Environment**: `env`, `isDevelopment`, `isProduction`
- **Server**: `port`, `host`
- **Database**: `host`, `port`, `name`, `user`, `password`, `ssl`, `pool` settings
- **Authentication**: `jwtSecret`, `jwtExpiresIn`, `bcryptRounds`
- **CORS**: `origin`, `credentials`
- **Domain**: `vps`, `frontend`, `backend`
- **N8N**: `baseUrl`, `webhookBase`, `apiKey`
- **External Services**: `openai`, `anthropic`
- **Application**: `name`, `version`, `defaultPageSize`, `maxPageSize`
- **Logging**: `level`, `format`

### Frontend Configuration

**Location**: `src/config/index.ts`

This file exports a typed `config` object for frontend settings:

```typescript
import config from '../config';

// Usage examples:
console.log(config.api.baseUrl);          // API base URL
console.log(config.n8n.defaultBaseUrl);   // Default N8N URL
console.log(config.app.name);             // Application name
```

#### Available Settings:

- **Environment**: `env`, `isDevelopment`, `isProduction`
- **API**: `baseUrl`, `timeout`
- **N8N**: `defaultBaseUrl`, `defaultWebhookBase`
- **Application**: `name`, `version`, `defaultPageSize`, `maxPageSize`
- **Features**: `enableDebugMode`, `enableAnalytics`

## Environment Variables

### Backend (.env)

Create a `backend/.env` file based on `backend/.env.example`:

```bash
# Required variables
DB_HOST=your-database-host
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
JWT_SECRET=your-secure-jwt-secret

# N8N Configuration
N8N_BASE_URL=https://n8n.your-domain.com/api/v1
N8N_WEBHOOK_BASE=https://n8n.your-domain.com
N8N_API_KEY=your-api-key

# Domain Configuration
VPS_DOMAIN=your-domain.com
```

### Frontend (.env)

Create a `.env` or `.env.local` file based on `.env.example`:

```bash
# Development
VITE_API_URL=http://localhost:8002/api

# Production
# VITE_API_URL=https://api.your-domain.com/api
```

## Migration from Hardcoded Values

All hardcoded references to `deradoslawkozdrun.pl` and other configuration values have been replaced with centralized configuration.

### Before (❌ Bad):

```javascript
const dbHost = 'deradoslawkozdrun.pl'; // Hardcoded!
const n8nUrl = 'https://n8n.deradoslawkozdrun.pl/api/v1'; // Hardcoded!
```

### After (✅ Good):

```javascript
const config = require('./config');
const dbHost = config.database.host;  // From .env
const n8nUrl = config.n8n.baseUrl;    // From .env
```

## Adding New Configuration

### Backend

1. Add environment variable to `backend/.env` and `backend/.env.example`
2. Add property to config object in `backend/src/config/index.js`
3. Use it in your code: `config.yourSection.yourProperty`

### Frontend

1. Add environment variable to `.env` and `.env.example` (prefix with `VITE_`)
2. Add property to `Config` interface in `src/config/index.ts`
3. Add property to config object
4. Use it in your code: `config.yourSection.yourProperty`

## Best Practices

1. **Never hardcode**: Always use configuration values, never hardcode hosts, URLs, or credentials
2. **Use .env files**: Store all environment-specific values in `.env` files
3. **Don't commit secrets**: Never commit `.env` files with real credentials to version control
4. **Document new settings**: Update this document when adding new configuration options
5. **Validate required values**: The config system validates required variables on startup
6. **Use type safety**: Frontend configuration is fully typed - leverage TypeScript for safety

## Security Notes

- The backend config includes a `getSafeConfig()` function that masks sensitive values for logging
- Never log full configuration objects in production
- Use environment variables or secure secret management for production deployments
- The frontend configuration should not contain any secrets (they would be exposed to clients)

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
DB_HOST=localhost
VITE_API_URL=http://localhost:8002/api
```

### Production
```bash
NODE_ENV=production
DB_HOST=your-production-db.com
DB_SSL=true
VITE_API_URL=https://api.your-domain.com/api
```

## Troubleshooting

### Backend won't start
- Check that all required environment variables are set in `backend/.env`
- Review console output for missing variables
- Verify database connection settings

### Frontend can't connect to API
- Verify `VITE_API_URL` in `.env` points to correct backend URL
- Check CORS settings in backend configuration
- Ensure backend is running on the specified port

### N8N integration not working
- Verify `N8N_BASE_URL` and `N8N_API_KEY` are correct
- Check N8N configuration in database (config_property table)
- Test connection using N8N Config Modal in the application
