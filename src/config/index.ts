/**
 * Central Configuration for FlowCraft Frontend Application
 *
 * This file contains all global configuration settings.
 * All configuration values should be loaded from environment variables (import.meta.env).
 *
 * IMPORTANT: Never hardcode sensitive values like API URLs or keys directly in the code.
 */

interface Config {
  // Environment
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
  };

  // N8N Configuration (defaults)
  n8n: {
    defaultBaseUrl: string;
    defaultWebhookBase: string;
  };

  // Application Settings
  app: {
    name: string;
    version: string;
    defaultPageSize: number;
    maxPageSize: number;
  };

  // Feature Flags
  features: {
    enableDebugMode: boolean;
    enableAnalytics: boolean;
  };
}

const config: Config = {
  // Environment
  env: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8002/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  },

  // N8N Configuration (defaults)
  n8n: {
    defaultBaseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://n8n.deradoslawkozdrun.pl/api/v1',
    defaultWebhookBase: import.meta.env.VITE_N8N_WEBHOOK_BASE || 'https://n8n.deradoslawkozdrun.pl',
  },

  // Application Settings
  app: {
    name: 'FlowCraft',
    version: '1.0.0',
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),
  },

  // Feature Flags
  features: {
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
};

// Validation - log warnings for missing optional configuration
if (!import.meta.env.VITE_API_URL && config.isDevelopment) {
  console.warn('⚠️ VITE_API_URL is not set, using default:', config.api.baseUrl);
}

// Helper function to get safe config for logging (masks sensitive values)
export const getSafeConfig = (): Partial<Config> => {
  return {
    env: config.env,
    api: {
      baseUrl: config.api.baseUrl,
      timeout: config.api.timeout,
    },
    app: config.app,
    features: config.features,
  };
};

// Log configuration on startup (development only)
if (config.isDevelopment) {
  console.log('🔧 FlowCraft Configuration:', getSafeConfig());
}

export default config;
