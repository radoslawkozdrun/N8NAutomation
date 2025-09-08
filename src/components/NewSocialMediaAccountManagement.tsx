import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from './AppIcon';
import Button from './ui/Button';
import AccountOverview from './social-media/AccountOverview';
import N8NIntegrationPanel from './social-media/N8NIntegrationPanel';
import AccountFilters from './social-media/AccountFilters';
import AccountTable from './social-media/AccountTable';

export function NewSocialMediaAccountManagement() {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // N8N Integration state
  const [n8nWorkflows, setN8nWorkflows] = useState([]);
  const [isN8nConnected, setIsN8nConnected] = useState(true);

  // Mock accounts data
  const mockAccounts = [
    {
      id: '1',
      platform: 'twitter',
      username: '@TechBlogPL',
      displayName: 'Tech Blog Polska',
      status: 'connected',
      followers: 15200,
      lastSync: new Date(Date.now() - 300000),
      connectionHealth: 'healthy',
      postingEnabled: true,
      apiRateLimit: {
        used: 150,
        limit: 300,
        resetTime: '14:30'
      }
    },
    {
      id: '2',
      platform: 'linkedin',
      username: 'tech-blog-polska',
      displayName: 'Tech Blog Polska Company',
      status: 'connected',
      followers: 3200,
      lastSync: new Date(Date.now() - 600000),
      connectionHealth: 'healthy',
      postingEnabled: true,
      apiRateLimit: {
        used: 45,
        limit: 100,
        resetTime: '15:00'
      }
    },
    {
      id: '3',
      platform: 'twitter',
      username: '@DevNewsPoland',
      displayName: 'Dev News Poland',
      status: 'error',
      followers: 8500,
      lastSync: new Date(Date.now() - 3600000),
      connectionHealth: 'unhealthy',
      postingEnabled: false,
      errorMessage: 'Authentication token expired - please reconnect',
      apiRateLimit: {
        used: 0,
        limit: 300,
        resetTime: 'N/A'
      }
    },
    {
      id: '4',
      platform: 'instagram',
      username: '@techblogpl',
      displayName: 'Tech Blog PL',
      status: 'warning',
      followers: 4200,
      lastSync: new Date(Date.now() - 7200000),
      connectionHealth: 'degraded',
      postingEnabled: true,
      warningMessage: 'Rate limit approaching - consider reducing posting frequency',
      apiRateLimit: {
        used: 180,
        limit: 200,
        resetTime: '16:00'
      }
    },
    {
      id: '5',
      platform: 'blog',
      username: 'tech-blog-pl',
      displayName: 'Tech Blog PL WordPress',
      status: 'connected',
      followers: 0,
      lastSync: new Date(Date.now() - 1800000),
      connectionHealth: 'healthy',
      postingEnabled: true,
      apiRateLimit: null
    }
  ];

  // Mock N8N workflows
  const mockN8nWorkflows = [
    {
      id: 'workflow-1',
      name: 'Twitter Account Sync',
      status: 'active',
      lastRun: new Date(Date.now() - 1800000),
      success: true,
      accountsImported: 2,
      description: 'Automatically imports and syncs Twitter accounts'
    },
    {
      id: 'workflow-2',
      name: 'LinkedIn Integration',
      status: 'active',
      lastRun: new Date(Date.now() - 3600000),
      success: true,
      accountsImported: 1,
      description: 'Syncs LinkedIn company and personal accounts'
    },
    {
      id: 'workflow-3',
      name: 'Instagram OAuth Refresh',
      status: 'paused',
      lastRun: new Date(Date.now() - 7200000),
      success: false,
      accountsImported: 0,
      description: 'Refreshes Instagram authentication tokens',
      errorMessage: 'OAuth endpoint returned 400 - Bad Request'
    },
    {
      id: 'workflow-4',
      name: 'Cross-Platform Sync',
      status: 'running',
      lastRun: new Date(Date.now() - 300000),
      success: true,
      accountsImported: 3,
      description: 'Syncs account data across all platforms'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccounts(mockAccounts);
      setN8nWorkflows(mockN8nWorkflows);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter accounts based on current filters
  useEffect(() => {
    let filtered = accounts;

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(account => account.platform === selectedPlatform);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(account => account.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(account => 
        account.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, selectedPlatform, selectedStatus, searchQuery]);

  // Account management handlers
  const handleDisconnectAccount = (accountId) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'disconnected', postingEnabled: false }
        : acc
    ));
    toast.success('Konto zostało rozłączone');
  };

  const handleRefreshAccount = (accountId) => {
    // Set account as connecting first
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'connecting' }
        : acc
    ));

    // Simulate refresh delay
    setTimeout(() => {
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { 
            ...acc, 
            lastSync: new Date(), 
            status: 'connected', 
            connectionHealth: 'healthy',
            errorMessage: undefined,
            warningMessage: undefined
          }
          : acc
      ));
      toast.success('Konto zostało odświeżone');
    }, 2000);
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccount(account);
    toast.info(`Szczegóły konta: ${account.displayName}`);
  };

  // N8N workflow handlers
  const handleRunWorkflow = (workflowId) => {
    setN8nWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: 'running', lastRun: new Date() }
        : workflow
    ));
    
    toast.success('Uruchamianie workflow N8N...');
    
    // Simulate workflow execution
    setTimeout(() => {
      setN8nWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId 
          ? { 
            ...workflow, 
            status: 'active', 
            success: true,
            accountsImported: Math.floor(Math.random() * 3) + 1
          }
          : workflow
      ));
      toast.success('Workflow został wykonany pomyślnie');
    }, 3000);
  };

  // Platform change handler
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
  };

  // Status change handler
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // Search change handler
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Calculate account statistics
  const accountStats = {
    total: accounts.length,
    connected: accounts.filter(acc => acc.status === 'connected').length,
    errors: accounts.filter(acc => acc.status === 'error').length,
    warnings: accounts.filter(acc => acc.status === 'warning').length,
    platforms: {
      twitter: accounts.filter(acc => acc.platform === 'twitter').length,
      linkedin: accounts.filter(acc => acc.platform === 'linkedin').length,
      instagram: accounts.filter(acc => acc.platform === 'instagram').length,
      blog: accounts.filter(acc => acc.platform === 'blog').length
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              NEW - Zarządzanie kontami społecznościowymi
            </h1>
            <p className="text-muted-foreground mt-2">
              Zarządzaj połączonymi kontami i integracjami API dla wszystkich platform
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
            >
              Ustawienia
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              onClick={() => toast.info('Dodawanie nowego konta...')}
            >
              Dodaj konto
            </Button>
          </div>
        </div>

        {/* Account Overview */}
        <AccountOverview
          stats={accountStats}
          isLoading={isLoading}
        />

        {/* N8N Integration Panel */}
        <N8NIntegrationPanel
          workflows={n8nWorkflows}
          isConnected={isN8nConnected}
          onRunWorkflow={handleRunWorkflow}
        />

        {/* Account Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Połączone konta ({filteredAccounts.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Zarządzaj wszystkimi połączonymi kontami społecznościowymi
              </p>
            </div>
            
            <AccountFilters
              selectedPlatform={selectedPlatform}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onPlatformChange={handlePlatformChange}
              onStatusChange={handleStatusChange}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Accounts Table */}
          <AccountTable
            accounts={filteredAccounts}
            isLoading={isLoading}
            onDisconnect={handleDisconnectAccount}
            onRefresh={handleRefreshAccount}
            onViewDetails={handleViewAccountDetails}
          />
        </div>

        {/* Quick Stats */}
        {!isLoading && accounts.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Podsumowanie aktywności
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {accountStats.connected}/{accountStats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sprawne połączenia
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {accounts.reduce((sum, acc) => sum + acc.followers, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Łączna liczba obserwujących
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {n8nWorkflows.filter(w => w.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktywne workflow N8N
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}