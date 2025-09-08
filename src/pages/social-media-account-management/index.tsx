import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMockNavigate } from '../../utils/mockNavigation';
import { useToast } from '../../components/ui/Toast';
import AccountOverview from './components/AccountOverview';
import AccountTable from './components/AccountTable';
import AddAccountModal from './components/AddAccountModal';
import AccountDetailsModal from './components/AccountDetailsModal';
import N8NIntegrationPanel from './components/N8NIntegrationPanel';
import AccountFilters from './components/AccountFilters';

const SocialMediaAccountManagement = () => {
  const navigate = useMockNavigate();
  const [searchParams] = useSearchParams();
  const { success, error, info } = useToast();

  // State management
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // N8N Integration state
  const [n8nWorkflows, setN8nWorkflows] = useState([]);
  const [isN8nConnected, setIsN8nConnected] = useState(true);

  // Mock user data
  const [user] = useState({
    id: 1,
    name: 'Anna Kowalska',
    role: 'ADMIN'
  });

  // Mock accounts data
  const mockAccounts = [
    {
      id: '1',
      platform: 'twitter',
      username: '@TechBlogPL',
      displayName: 'Tech Blog Polska',
      status: 'connected',
      followers: 15200,
      lastSync: new Date(Date.now() - 300000), // 5 min ago
      connectionHealth: 'healthy',
      apiRateLimit: { used: 245, limit: 300, resetTime: '15:30' },
      permissions: ['read', 'write', 'delete'],
      authExpiresAt: new Date(Date.now() + 86400000 * 30), // 30 days
      postingEnabled: true,
      contentFormatPrefs: {
        hashtags: true,
        mentions: true,
        autoThread: false
      }
    },
    {
      id: '2',
      platform: 'linkedin',
      username: 'tech-blog-polska',
      displayName: 'Tech Blog Polska Company',
      status: 'connected',
      followers: 3200,
      lastSync: new Date(Date.now() - 600000), // 10 min ago
      connectionHealth: 'healthy',
      apiRateLimit: { used: 45, limit: 100, resetTime: '16:00' },
      permissions: ['read', 'write'],
      authExpiresAt: new Date(Date.now() + 86400000 * 60), // 60 days
      postingEnabled: true,
      contentFormatPrefs: {
        hashtags: false,
        mentions: true,
        autoThread: false
      }
    },
    {
      id: '3',
      platform: 'twitter',
      username: '@DevNewsPoland',
      displayName: 'Dev News Poland',
      status: 'error',
      followers: 8500,
      lastSync: new Date(Date.now() - 3600000), // 1 hour ago
      connectionHealth: 'unhealthy',
      apiRateLimit: { used: 0, limit: 300, resetTime: null },
      permissions: [],
      authExpiresAt: new Date(Date.now() - 86400000), // Expired
      postingEnabled: false,
      contentFormatPrefs: {
        hashtags: true,
        mentions: true,
        autoThread: true
      },
      errorMessage: 'Authentication token expired - please reconnect'
    },
    {
      id: '4',
      platform: 'instagram',
      username: '@techblogpl',
      displayName: 'Tech Blog PL',
      status: 'warning',
      followers: 4200,
      lastSync: new Date(Date.now() - 7200000), // 2 hours ago
      connectionHealth: 'degraded',
      apiRateLimit: { used: 180, limit: 200, resetTime: '17:00' },
      permissions: ['read', 'write'],
      authExpiresAt: new Date(Date.now() + 86400000 * 7), // 7 days
      postingEnabled: true,
      contentFormatPrefs: {
        hashtags: true,
        mentions: false,
        autoThread: false
      },
      warningMessage: 'Rate limit approaching - consider reducing posting frequency'
    },
    {
      id: '5',
      platform: 'linkedin',
      username: 'anna-kowalska-dev',
      displayName: 'Anna Kowalska - Personal',
      status: 'connected',
      followers: 1850,
      lastSync: new Date(Date.now() - 900000), // 15 min ago
      connectionHealth: 'healthy',
      apiRateLimit: { used: 12, limit: 100, resetTime: '16:00' },
      permissions: ['read', 'write'],
      authExpiresAt: new Date(Date.now() + 86400000 * 45), // 45 days
      postingEnabled: false, // Personal account, posting disabled
      contentFormatPrefs: {
        hashtags: false,
        mentions: true,
        autoThread: false
      }
    }
  ];

  // Mock N8N workflows
  const mockN8nWorkflows = [
    {
      id: 'workflow-1',
      name: 'Twitter Account Sync',
      status: 'active',
      lastRun: new Date(Date.now() - 1800000), // 30 min ago
      success: true,
      accountsImported: 2,
      description: 'Automatically imports and syncs Twitter accounts'
    },
    {
      id: 'workflow-2',
      name: 'LinkedIn Integration',
      status: 'active',
      lastRun: new Date(Date.now() - 3600000), // 1 hour ago
      success: true,
      accountsImported: 1,
      description: 'Syncs LinkedIn company and personal accounts'
    },
    {
      id: 'workflow-3',
      name: 'Instagram OAuth Refresh',
      status: 'paused',
      lastRun: new Date(Date.now() - 7200000), // 2 hours ago
      success: false,
      accountsImported: 0,
      description: 'Refreshes Instagram authentication tokens',
      errorMessage: 'OAuth endpoint returned 400 - Bad Request'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccounts(mockAccounts);
      setN8nWorkflows(mockN8nWorkflows);
      setIsLoading(false);
      
      // Check if we should open add account modal
      if (searchParams?.get('action') === 'add') {
        setShowAddAccount(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter accounts based on current filters
  useEffect(() => {
    let filtered = accounts;

    if (selectedPlatform !== 'all') {
      filtered = filtered?.filter(account => account?.platform === selectedPlatform);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered?.filter(account => account?.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered?.filter(account => 
        account?.displayName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        account?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, selectedPlatform, selectedStatus, searchQuery]);

  // Account management handlers
  const handleAddAccount = (accountData) => {
    const newAccount = {
      id: Date.now()?.toString(),
      ...accountData,
      status: 'connecting',
      lastSync: new Date(),
      connectionHealth: 'pending'
    };

    setAccounts(prev => [...prev, newAccount]);
    setShowAddAccount(false);
    info('Łączenie z nowym kontem w toku...');

    // Simulate connection process
    setTimeout(() => {
      setAccounts(prev => prev?.map(acc => 
        acc?.id === newAccount?.id 
          ? { ...acc, status: 'connected', connectionHealth: 'healthy' }
          : acc
      ));
      success('Konto zostało pomyślnie połączone!');
    }, 3000);
  };

  const handleDisconnectAccount = (accountId) => {
    setAccounts(prev => prev?.map(acc => 
      acc?.id === accountId 
        ? { ...acc, status: 'disconnected', postingEnabled: false }
        : acc
    ));
    info('Konto zostało rozłączone');
  };

  const handleRefreshAccount = (accountId) => {
    setAccounts(prev => prev?.map(acc => 
      acc?.id === accountId 
        ? { ...acc, lastSync: new Date(), status: 'connected', connectionHealth: 'healthy' }
        : acc
    ));
    success('Konto zostało odświeżone');
  };

  const handleAccountDetails = (account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  const handleUpdateAccountSettings = (accountId, settings) => {
    setAccounts(prev => prev?.map(acc => 
      acc?.id === accountId 
        ? { ...acc, ...settings }
        : acc
    ));
    success('Ustawienia konta zostały zaktualizowane');
  };

  // N8N workflow handlers
  const handleRunWorkflow = (workflowId) => {
    setN8nWorkflows(prev => prev?.map(workflow => 
      workflow?.id === workflowId 
        ? { ...workflow, status: 'running', lastRun: new Date() }
        : workflow
    ));
    
    info('Uruchamianie workflow N8N...');
    
    // Simulate workflow execution
    setTimeout(() => {
      setN8nWorkflows(prev => prev?.map(workflow => 
        workflow?.id === workflowId 
          ? { 
            ...workflow, 
            status: 'active', 
            success: true,
            accountsImported: Math.floor(Math.random() * 3) + 1
          }
          : workflow
      ));
      success('Workflow został wykonany pomyślnie');
    }, 5000);
  };

  // Calculate account statistics
  const accountStats = {
    total: accounts?.length,
    connected: accounts?.filter(acc => acc?.status === 'connected')?.length,
    errors: accounts?.filter(acc => acc?.status === 'error')?.length,
    warnings: accounts?.filter(acc => acc?.status === 'warning')?.length,
    platforms: {
      twitter: accounts?.filter(acc => acc?.platform === 'twitter')?.length,
      linkedin: accounts?.filter(acc => acc?.platform === 'linkedin')?.length,
      instagram: accounts?.filter(acc => acc?.platform === 'instagram')?.length,
      blog: accounts?.filter(acc => acc?.platform === 'blog')?.length
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Zarządzanie kontami społecznościowymi
            </h1>
            <p className="text-muted-foreground mt-1">
              Zarządzaj połączonymi kontami i integracjami API dla wszystkich platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <span>Panel główny</span>
              <span>→</span>
            </button>
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

        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <AccountFilters
            selectedPlatform={selectedPlatform}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
            onPlatformChange={setSelectedPlatform}
            onStatusChange={setSelectedStatus}
            onSearchChange={setSearchQuery}
          />
          
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span>+</span>
            <span>Dodaj konto</span>
          </button>
        </div>

        {/* Accounts Table */}
        <AccountTable
          accounts={filteredAccounts}
          isLoading={isLoading}
          onDisconnect={handleDisconnectAccount}
          onRefresh={handleRefreshAccount}
          onViewDetails={handleAccountDetails}
        />

        {/* Modals */}
        {showAddAccount && (
          <AddAccountModal
            onClose={() => setShowAddAccount(false)}
            onAddAccount={handleAddAccount}
          />
        )}

        {showAccountDetails && selectedAccount && (
          <AccountDetailsModal
            account={selectedAccount}
            onClose={() => setShowAccountDetails(false)}
            onUpdateSettings={(settings) => handleUpdateAccountSettings(selectedAccount?.id, settings)}
          />
        )}
      </div>
    </div>
  );
};

export default SocialMediaAccountManagement;