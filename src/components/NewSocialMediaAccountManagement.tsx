import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from './AppIcon';
import Button from './ui/Button';
import AccountOverview from './social-media/AccountOverview';
import N8NIntegrationPanel from './social-media/N8NIntegrationPanel';
import AccountFilters from './social-media/AccountFilters';
import AccountTable from './social-media/AccountTable';
import N8NConfigModal from './N8NConfigModal';
import { api } from '@/lib/api';
import { N8nWorkflow } from '@/types';

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
  const [n8nWorkflows, setN8nWorkflows] = useState<N8nWorkflow[]>([]);
  const [isN8nConnected, setIsN8nConnected] = useState(false);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [showN8NConfig, setShowN8NConfig] = useState(false);

  // Transform database account to component format
  const transformAccount = (dbAccount: any) => ({
    id: dbAccount.id.toString(),
    platform: dbAccount.platform,
    username: dbAccount.username,
    displayName: dbAccount.display_name,
    status: dbAccount.status,
    followers: dbAccount.followers || 0,
    lastSync: dbAccount.last_sync ? new Date(dbAccount.last_sync) : null,
    connectionHealth: dbAccount.connection_health,
    postingEnabled: dbAccount.posting_enabled,
    errorMessage: dbAccount.error_message,
    warningMessage: dbAccount.warning_message,
    apiRateLimit: dbAccount.api_rate_limit_total ? {
      used: dbAccount.api_rate_limit_used || 0,
      limit: dbAccount.api_rate_limit_total,
      resetTime: dbAccount.api_rate_limit_reset_time || 'N/A'
    } : null
  });

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

  // Transform n8n workflow to match component expected format
  const transformN8nWorkflow = (workflow: N8nWorkflow) => ({
    id: workflow.id,
    name: workflow.name,
    status: workflow.active ? 'active' : 'paused',
    lastRun: workflow.updatedAt ? new Date(workflow.updatedAt) : null,
    success: true, // We'll assume success unless we have execution data
    accountsImported: 0, // This would need to be calculated from execution data
    description: workflow.tags?.length ? `Tagi: ${workflow.tags.join(', ')}` : 'Workflow n8n',
    tags: workflow.tags || [],
    nodes: workflow.nodes?.length || 0,
  });

  // Show all workflows (removed ContentFlowAI filtering)
  const isRelevantWorkflow = (workflow: N8nWorkflow) => {
    // Show all workflows without filtering
    return true;
  };

  // Load n8n workflows
  const loadN8nWorkflows = async () => {
    setN8nLoading(true);
    try {
      const workflows = await api.n8n.getWorkflows();

      // Debug: Log first few workflows to see their structure
      console.log('🔍 N8N Workflows structure:', workflows.slice(0, 3).map(w => ({
        id: w.id,
        name: w.name,
        tags: w.tags,
        tagsType: typeof w.tags,
        tagsArray: Array.isArray(w.tags),
        folder: (w as any).folder || 'no folder property'
      })));

      // Debug: Log all workflow names and tags to find ContentFlowAI ones
      console.log('🔍 All workflow names and tags:');
      workflows.forEach((w, index) => {
        console.log(`${index + 1}. "${w.name}" - Tags: [${w.tags ? w.tags.join(', ') : 'none'}]`);
      });

      // Filter workflows to only show ones from ContentFlowAI folder
      const relevantWorkflows = workflows.filter(isRelevantWorkflow);

      // Debug: Log filtering results
      console.log(`🔍 Filtering results: ${relevantWorkflows.length}/${workflows.length} workflows match criteria`);

      // Transform workflows to match component format
      const transformedWorkflows = relevantWorkflows.map(transformN8nWorkflow);
      setN8nWorkflows(transformedWorkflows);
      setIsN8nConnected(true);
      toast.success(`Loaded ${relevantWorkflows.length} workflows from n8n`);
    } catch (error: any) {
      console.error('Failed to load n8n workflows:', error);
      setIsN8nConnected(false);
      // Fallback to mock data if n8n is not available
      setN8nWorkflows(mockN8nWorkflows);
      toast.error(`Cannot connect to n8n: ${error.message}`);
    } finally {
      setN8nLoading(false);
    }
  };

  // Load social media accounts from API
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const filters = {
        platform: selectedPlatform,
        status: selectedStatus,
        search: searchQuery
      };

      const response = await api.getSocialMediaAccounts(filters, 1, 100); // Get all accounts for now
      const transformedAccounts = response.data.map(transformAccount);
      setAccounts(transformedAccounts);

      console.log(`✅ Loaded ${transformedAccounts.length} social media accounts`);
    } catch (error: any) {
      console.error('Failed to load social media accounts:', error);
      toast.error(`Cannot load accounts: ${error.message}`);
      setAccounts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAccounts();
    loadN8nWorkflows();
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
  const handleDisconnectAccount = async (accountId) => {
    try {
      // Update account status to disconnected via API
      await api.updateSocialMediaAccountStatus(parseInt(accountId), {
        status: 'disconnected',
        error_message: null,
        warning_message: null
      });

      // Update local state
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId
          ? { ...acc, status: 'disconnected', postingEnabled: false }
          : acc
      ));

      toast.success('Account has been disconnected');
    } catch (error: any) {
      console.error('Failed to disconnect account:', error);
      toast.error(`Cannot disconnect account: ${error.message}`);
    }
  };

  const handleRefreshAccount = async (accountId) => {
    try {
      // Set account as connecting first
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId
          ? { ...acc, status: 'connecting' }
          : acc
      ));

      // Update account status to connected via API
      await api.updateSocialMediaAccountStatus(parseInt(accountId), {
        status: 'connected',
        error_message: null,
        warning_message: null
      });

      // Update local state
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

      toast.success('Account has been refreshed');
    } catch (error: any) {
      console.error('Failed to refresh account:', error);
      toast.error(`Cannot refresh account: ${error.message}`);

      // Revert status on error
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId
          ? { ...acc, status: 'error' }
          : acc
      ));
    }
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccount(account);
    toast.info(`Account details: ${account.displayName}`);
  };

  // N8N workflow handlers
  const handleRunWorkflow = async (workflowId) => {
    try {
      setN8nWorkflows(prev => prev.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: 'running', lastRun: new Date() }
          : workflow
      ));

      toast.success('Starting N8N workflow...');

      // Execute workflow via n8n API
      await api.n8n.executeWorkflow(workflowId);

      // Update status after execution
      setTimeout(() => {
        setN8nWorkflows(prev => prev.map(workflow =>
          workflow.id === workflowId
            ? { ...workflow, status: 'active', success: true }
            : workflow
        ));
        toast.success('Workflow executed successfully');
      }, 3000);

    } catch (error: any) {
      console.error('Failed to execute workflow:', error);
      setN8nWorkflows(prev => prev.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: 'error', success: false }
          : workflow
      ));
      toast.error(`Workflow execution error: ${error.message}`);
    }
  };

  const handleRefreshWorkflows = () => {
    loadN8nWorkflows();
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

  // Reload accounts when filters change
  useEffect(() => {
    if (!isLoading) { // Only reload if not currently loading
      loadAccounts();
    }
  }, [selectedPlatform, selectedStatus, searchQuery]);

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
    <div className="h-full flex flex-col p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="skote-page-title">
              N8N Overview
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage N8N workflows and connected social media accounts
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              onClick={() => setShowN8NConfig(true)}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* N8N Integration Panel */}
        <N8NIntegrationPanel
          workflows={n8nWorkflows}
          isConnected={isN8nConnected}
          isLoading={n8nLoading}
          onRunWorkflow={handleRunWorkflow}
          onRefresh={handleRefreshWorkflows}
        />

        {/* Account Overview */}
        <AccountOverview
          stats={accountStats}
          isLoading={isLoading}
        />

        {/* Account Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="skote-card-title text-foreground">
                Connected Accounts ({filteredAccounts.length})
              </h2>
              <p className="skote-body-text text-muted-foreground">
                Manage all connected social media accounts
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
            <h3 className="skote-card-title text-foreground mb-4">
              Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="skote-section-title font-bold text-success">
                  {accountStats.connected}/{accountStats.total}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Active Connections
                </div>
              </div>
              <div className="text-center">
                <div className="skote-section-title font-bold text-primary">
                  {accounts.reduce((sum, acc) => sum + acc.followers, 0).toLocaleString()}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Total Followers
                </div>
              </div>
              <div className="text-center">
                <div className="skote-section-title font-bold text-warning">
                  {n8nWorkflows.filter(w => w.status === 'active').length}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Active N8N workflows
                </div>
              </div>
            </div>
          </div>
        )}

        {/* N8N Configuration Modal */}
        <N8NConfigModal
          isOpen={showN8NConfig}
          onClose={() => setShowN8NConfig(false)}
          onConfigSaved={() => {
            setShowN8NConfig(false);
            handleRefreshWorkflows();
            toast.success('N8N configuration saved successfully');
          }}
        />
    </div>
  );
}