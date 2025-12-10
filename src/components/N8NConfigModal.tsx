import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { cn } from '../lib/utils';
import Toast from './ui/Toast';
import appConfig from '../config';

// Use centralized API configuration
const API_BASE_URL = appConfig.api.baseUrl;

interface N8NConfig {
  baseUrl: string;
  apiKey: string;
  timeout: string;
  retryAttempts: string;
}

interface N8NConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

const N8NConfigModal: React.FC<N8NConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<N8NConfig>({
    baseUrl: appConfig.n8n.defaultBaseUrl,
    apiKey: '',
    timeout: '30000',
    retryAttempts: '3'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Always load current config first
      loadCurrentConfig();
    }
  }, [isOpen]);

  const autoLoginForDevelopment = async () => {
    try {
      console.log('Auto-logging in for development...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: '1qaz@WSX'
        })
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('authToken', result.data.token);
        console.log('Auto-login successful');
        setToast({
          message: 'Zalogowano automatycznie jako admin (tryb deweloperski)',
          type: 'success'
        });
        loadCurrentConfig();
      } else {
        console.error('Auto-login failed');
        loadCurrentConfig();
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      loadCurrentConfig();
    }
  };

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      if (!token) {
        console.log('No auth token found, using default config values');
        // Don't show error toast for missing token - just use defaults
        setConfig({
          baseUrl: appConfig.n8n.defaultBaseUrl,
          apiKey: '',
          timeout: '30000',
          retryAttempts: '3'
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/n8n/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Ensure we have valid values, fallback to defaults if needed
          const loadedConfig = {
            baseUrl: result.data.baseUrl || appConfig.n8n.defaultBaseUrl,
            apiKey: result.data.apiKey || '',
            timeout: result.data.timeout || '30000',
            retryAttempts: result.data.retryAttempts || '3'
          };
          setConfig(loadedConfig);
          console.log('N8N config loaded from database:', loadedConfig);
        } else {
          throw new Error(result.message || 'Invalid response format');
        }
      } else {
        console.error('Failed to load N8N config, status:', response.status);
        const errorData = await response.json().catch(() => ({}));

        // Use defaults but show warning
        setConfig({
          baseUrl: appConfig.n8n.defaultBaseUrl,
          apiKey: '',
          timeout: '30000',
          retryAttempts: '3'
        });

        setToast({
          message: `Cannot load configuration from database. Using default values.`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to load N8N config:', error);

      // Always provide default values even on error
      setConfig({
        baseUrl: appConfig.n8n.defaultBaseUrl,
        apiKey: '',
        timeout: '30000',
        retryAttempts: '3'
      });

      setToast({
        message: 'Error loading configuration. Using default values.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.baseUrl.trim()) {
      newErrors.baseUrl = 'Base URL jest wymagany';
    } else if (!config.baseUrl.startsWith('http')) {
      newErrors.baseUrl = 'Base URL must start with http:// or https://';
    }

    if (!config.apiKey.trim()) {
      newErrors.apiKey = 'API Key jest wymagany';
    }

    const timeoutNum = parseInt(config.timeout);
    if (isNaN(timeoutNum) || timeoutNum < 1000) {
      newErrors.timeout = 'Timeout must be a number greater than 1000ms';
    }

    const retryNum = parseInt(config.retryAttempts);
    if (isNaN(retryNum) || retryNum < 0 || retryNum > 10) {
      newErrors.retryAttempts = 'Number of attempts must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsTesting(true);

      // First save the config, then test
      const saveResponse = await fetch(`${API_BASE_URL}/n8n/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save configuration');
      }

      // Now test the connection
      const testResponse = await fetch(`${API_BASE_URL}/n8n/config/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      });

      const result = await testResponse.json();

      if (result.success) {
        setToast({
          message: `Connection successful! Found ${result.data.workflowCount} workflows.`,
          type: 'success'
        });
      } else {
        setToast({
          message: `Connection error: ${result.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: `Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setToast({
        message: 'Missing authorization token. Please log in again.',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/n8n/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setToast({
            message: 'N8N configuration saved successfully',
            type: 'success'
          });
          setTimeout(() => {
            onConfigSaved();
            onClose();
          }, 1500);
        } else {
          setToast({
            message: `Error while saving: ${result.message || 'Unknown error'}`,
            type: 'error'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setToast({
          message: `Server error (${response.status}): ${errorData.message || 'Cannot save configuration'}`,
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: `Error saving configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof N8NConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Konfiguracja N8N
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure connection to N8N server for automatic workflows
            </p>
          </div>

          <div className="p-6 space-y-6">
            {isLoading && !isTesting && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-3">Ładowanie konfiguracji...</p>
                <p className="text-xs text-gray-500 mt-1">Loading settings from database</p>
              </div>
            )}

            {!isLoading && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL *
                  </label>
                  <input
                    type="url"
                    value={config.baseUrl}
                    onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                      errors.baseUrl ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="https://n8n.example.com/api/v1"
                  />
                  {errors.baseUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.baseUrl}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    URL podstawowy do API N8N (z /api/v1)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={config.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                        errors.apiKey ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter N8N API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.apiKey && (
                    <p className="text-sm text-red-600 mt-1">{errors.apiKey}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Klucz API do autoryzacji z serwerem N8N
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={config.timeout}
                      onChange={(e) => handleInputChange('timeout', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                        errors.timeout ? "border-red-300" : "border-gray-300"
                      )}
                      min="1000"
                      step="1000"
                    />
                    {errors.timeout && (
                      <p className="text-sm text-red-600 mt-1">{errors.timeout}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      value={config.retryAttempts}
                      onChange={(e) => handleInputChange('retryAttempts', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                        errors.retryAttempts ? "border-red-300" : "border-gray-300"
                      )}
                      min="0"
                      max="10"
                    />
                    {errors.retryAttempts && (
                      <p className="text-sm text-red-600 mt-1">{errors.retryAttempts}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isTesting}
            >
              Anuluj
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading || isTesting}
                loading={isTesting}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>

              <Button
                onClick={handleSave}
                disabled={isLoading || isTesting}
                loading={isLoading}
              >
                {isLoading ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default N8NConfigModal;