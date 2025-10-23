import React, { useState, useEffect } from 'react';
import {
  Rss,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  Eye,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import Button from './ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Feed {
  id: number;
  name: string;
  url: string;
  description: string;
  type: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  last_checked: string | null;
  error_count: number;
  last_error: string | null;
  domain_id: number | null;
  domain_name: string | null;
  domain_code: string | null;
}

interface FeedStats {
  overview: {
    total_feeds: number;
    enabled_feeds: number;
    disabled_feeds: number;
    checked_feeds: number;
    error_feeds: number;
    avg_error_count: number;
  };
  types: Array<{
    type: string;
    count: number;
    enabled_count: number;
  }>;
}

export function FeedManagement() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [domains, setDomains] = useState<any[]>([]);

  // Filters and pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'stats'
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [isWorkflowCallsExpanded, setIsWorkflowCallsExpanded] = useState(true);
  const [selectedFeeds, setSelectedFeeds] = useState<number[]>([]);
  const [fetchingArticles, setFetchingArticles] = useState(false);
  const [fetchingTest, setFetchingTest] = useState(false);
  const [fetchLogs, setFetchLogs] = useState<Array<{
    id: string;
    timestamp: Date;
    user: string;
    status: 'success' | 'error' | 'pending';
    request: {
      fetchType: string;
      ids: number[];
    };
    response: any;
    error?: string;
  }>>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [expandedLogSections, setExpandedLogSections] = useState<Record<string, Set<string>>>({}); // logId -> Set of section names
  
  // Bulk actions state
  const [selectedFeedRows, setSelectedFeedRows] = useState<Set<number>>(new Set());
  const [selectAllFeeds, setSelectAllFeeds] = useState(false);

  // Feed Fetch Logs state
  const [feedFetchLogs, setFeedFetchLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsStatus, setLogsStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    type: '',
    enabled: true,
    domain_id: '' as string | number
  });

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      toast.error(message);
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter !== 'all') filters.enabled = statusFilter === 'enabled';
      if (sortBy) filters.sort_by = sortBy;
      if (sortOrder) filters.sort_order = sortOrder;

      const response = await api.getFeeds(filters, page, 20);
      setFeeds(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (error: any) {
      console.error('Error fetching feeds:', error);
      if (error?.status === 401) {
        showMessage('Authentication failed - please log in again', 'error');
        localStorage.removeItem('authToken');
      } else {
        showMessage(error?.message || 'Failed to load feeds', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getFeedStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await api.getFeedTypes();
      setTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch types:', error);
      setTypes(['RSS', 'Atom', 'JSON']);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await api.getDomains();
      setDomains(response.data);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      setDomains([]);
    }
  };

  const fetchLogsFromServer = async () => {
    try {
      const response = await api.getFetchLogs();
      if (response.success && response.data) {
        // Transform server logs to match frontend format
        const transformedLogs = response.data.map((log: any) => ({
          id: log.id.toString(),
          timestamp: new Date(log.timestamp),
          user: log.user,
          status: log.status,
          request: {
            fetchType: log.fetchType,
            ids: log.ids === 'ALL' ? [] : log.ids
          },
          response: {
            ...log.responseData,
            webhookPayload: log.webhookPayload
          },
          error: log.error,
          httpStatus: log.httpStatus,
          message: log.message
        }));
        setFetchLogs(transformedLogs);
      }
    } catch (error) {
      console.error('Failed to fetch logs from server:', error);
    }
  };

  const fetchFeedFetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await api.getFetchLogs(logsPage, 20, logsStatus, logsSearch);
      if (response.success && response.data) {
        // Map database status values to frontend expected values
        const transformedData = response.data.map((log: any) => ({
          ...log,
          status: log.status === 'SUCCESS' ? 'completed' :
                  log.status === 'FAILED' ? 'failed' :
                  log.status === 'RUNNING' ? 'pending' :
                  log.status.toLowerCase()
        }));
        setFeedFetchLogs(transformedData);
        if (response.pagination) {
          setLogsTotalPages(response.pagination.total_pages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch feed fetch logs:', error);
      showMessage('Failed to load feed fetch logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchFeeds();
    fetchStats();
    fetchTypes();
    fetchDomains();
    fetchLogsFromServer();
  }, [page, debouncedSearch, typeFilter, statusFilter, sortBy, sortOrder]);

  // Load feed fetch logs
  useEffect(() => {
    if (currentView === 'stats') {
      fetchFeedFetchLogs();
    }
  }, [currentView, logsPage, logsStatus, logsSearch]);

  // Clear selection when feeds change (pagination, filters, etc.)
  useEffect(() => {
    setSelectedFeedRows(new Set());
    setSelectAllFeeds(false);
  }, [page, debouncedSearch, typeFilter, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-500" /> : 
      <ArrowDown className="w-4 h-4 text-blue-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData, 'editingFeed:', editingFeed);

    if (!formData.name || !formData.url) {
      showMessage('Name and URL are required', 'error');
      return;
    }

    if (!formData.domain_id) {
      showMessage('Domain is required', 'error');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editingFeed) {
        console.log('Updating feed with ID:', editingFeed.id);
        response = await api.updateFeed(editingFeed.id, formData);
      } else {
        console.log('Creating new feed');
        response = await api.createFeed(formData);
      }
      
      console.log('API response:', response);
      showMessage(response.message || `Feed ${editingFeed ? 'updated' : 'created'} successfully`, 'success');
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingFeed(null);
      setFormData({ name: '', url: '', description: '', type: '', enabled: true, domain_id: '' });
      fetchFeeds();
      fetchStats();
      fetchTypes();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      showMessage(error?.message || 'Failed to save feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeed = async (id: number) => {
    try {
      const response = await api.toggleFeed(id);
      showMessage(response.message, 'success');
      fetchFeeds();
      fetchStats();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to toggle feed', 'error');
    }
  };

  const deleteFeed = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await api.deleteFeed(id);
      showMessage(response.message, 'success');
      fetchFeeds();
      fetchStats();
      fetchTypes();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to delete feed', 'error');
    }
  };

  const openEditModal = (feed: Feed) => {
    console.log('Opening edit modal for feed:', feed);
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      url: feed.url,
      description: feed.description || '',
      type: feed.type || '',
      enabled: feed.enabled,
      domain_id: feed.domain_id || ''
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowStatsModal(false);
    setEditingFeed(null);
    setFormData({ name: '', url: '', description: '', type: '', enabled: true, domain_id: '' });
  };

  const handleFetchArticles = async () => {
    try {
      setFetchingArticles(true);
      console.log('🚀 Triggering production webhook...');

      const response = await api.post('/webhook/fetch-feeds', {
        webhookType: 'production'
      });

      if (response.success) {
        toast.success(`Production webhook triggered! Processed ${response.feedsProcessed} feeds.`);
        console.log('✅ Webhook response:', response);

        // Refresh feed list after successful webhook
        setTimeout(() => {
          fetchFeeds();
        }, 2000);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Production webhook failed:', error);
      toast.error(`Failed to trigger production webhook: ${error.message}`);
    } finally {
      setFetchingArticles(false);
    }
  };

  const handleFetchTest = async () => {
    try {
      setFetchingTest(true);
      console.log('🚀 Triggering test webhook...');

      const response = await api.post('/webhook/fetch-feeds', {
        webhookType: 'test'
      });

      if (response.success) {
        toast.success(`Test webhook triggered! Processed ${response.feedsProcessed} feeds.`);
        console.log('✅ Test webhook response:', response);

        // Refresh feed list after successful webhook
        setTimeout(() => {
          fetchFeeds();
        }, 2000);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Test webhook failed:', error);
      toast.error(`Failed to trigger test webhook: ${error.message}`);
    } finally {
      setFetchingTest(false);
    }
  };

  // Webhook trigger functions

  const getStatusBadgeColor = (enabled: boolean, errorCount: number) => {
    if (!enabled) {
      return 'text-muted-foreground bg-muted border-border';
    }
    if (errorCount > 0) {
      return 'text-warning bg-warning/10 border-warning/20';
    }
    return 'text-success bg-success/10 border-success/20';
  };

  const getStatusText = (enabled: boolean, errorCount: number) => {
    if (!enabled) return 'Disabled';
    if (errorCount > 0) return 'Errors';
    return 'Active';
  };

  const clearFetchLogs = async () => {
    if (!confirm('Are you sure you want to clear all fetch logs? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.clearFetchLogs();
      if (response.success) {
        setFetchLogs([]);
        showMessage('Fetch logs cleared successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to clear logs');
      }
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      showMessage(error?.message || 'Failed to clear logs', 'error');
    }
  };

  const toggleLogSection = (logId: string, sectionName: string) => {
    setExpandedLogSections(prev => {
      const logSections = prev[logId] || new Set();
      const newLogSections = new Set(logSections);
      
      if (newLogSections.has(sectionName)) {
        newLogSections.delete(sectionName);
      } else {
        newLogSections.add(sectionName);
      }
      
      return {
        ...prev,
        [logId]: newLogSections
      };
    });
  };

  const isLogSectionExpanded = (logId: string, sectionName: string) => {
    return expandedLogSections[logId]?.has(sectionName) || false;
  };

  // Bulk actions functions
  const handleSelectAllFeeds = (checked: boolean) => {
    setSelectAllFeeds(checked);
    if (checked) {
      setSelectedFeedRows(new Set(feeds.map(feed => feed.id)));
    } else {
      setSelectedFeedRows(new Set());
    }
  };

  const handleSelectFeedRow = (feedId: number, checked: boolean) => {
    const newSelection = new Set(selectedFeedRows);
    if (checked) {
      newSelection.add(feedId);
    } else {
      newSelection.delete(feedId);
    }
    setSelectedFeedRows(newSelection);
    
    // Update select all state
    setSelectAllFeeds(newSelection.size === feeds.length && feeds.length > 0);
  };

  const handleBulkFetchFeeds = async () => {
    if (selectedFeedRows.size === 0) {
      showMessage('Please select at least one feed to fetch', 'error');
      return;
    }

    try {
      setFetchingArticles(true);
      
      // Use the existing fetch logic with selected feed IDs
      const response = await fetch('/api/feeds/fetch-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          fetchType: 'SELECTED',
          ids: Array.from(selectedFeedRows)
        })
      });

      const responseData = await response.json();
      
      if (response.ok) {
        showMessage(`Fetch initiated for ${selectedFeedRows.size} selected feeds`, 'success');
        setSelectedFeedRows(new Set());
        setSelectAllFeeds(false);
        setTimeout(() => fetchLogsFromServer(), 1000);
      } else {
        throw new Error(`Failed to initiate fetch: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error bulk fetching feeds:', error);
      showMessage(error?.message || 'Failed to fetch selected feeds', 'error');
    } finally {
      setFetchingArticles(false);
    }
  };

  const handleBulkDeleteFeeds = async () => {
    if (selectedFeedRows.size === 0) {
      showMessage('Please select at least one feed to delete', 'error');
      return;
    }

    const selectedNames = feeds
      .filter(feed => selectedFeedRows.has(feed.id))
      .map(feed => feed.name);

    if (!confirm(`Are you sure you want to delete ${selectedFeedRows.size} selected feeds?\n\nFeeds to delete:\n${selectedNames.join('\n')}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const deletePromises = Array.from(selectedFeedRows).map(feedId => 
        api.deleteFeed(feedId)
      );

      const results = await Promise.allSettled(deletePromises);
      const succeeded = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (succeeded > 0) {
        showMessage(`Successfully deleted ${succeeded} feed${succeeded !== 1 ? 's' : ''}`, 'success');
        fetchFeeds();
        fetchStats();
        fetchTypes();
      }

      if (failed > 0) {
        showMessage(`Failed to delete ${failed} feed${failed !== 1 ? 's' : ''}`, 'error');
      }

      setSelectedFeedRows(new Set());
      setSelectAllFeeds(false);
    } catch (error: any) {
      console.error('Error bulk deleting feeds:', error);
      showMessage(error?.message || 'Failed to delete selected feeds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkToggleFeeds = async (enable: boolean) => {
    if (selectedFeedRows.size === 0) {
      showMessage('Please select at least one feed to toggle', 'error');
      return;
    }

    const action = enable ? 'enable' : 'disable';
    const selectedNames = feeds
      .filter(feed => selectedFeedRows.has(feed.id))
      .map(feed => feed.name);

    if (!confirm(`Are you sure you want to ${action} ${selectedFeedRows.size} selected feeds?\n\nFeeds to ${action}:\n${selectedNames.join('\n')}`)) {
      return;
    }

    try {
      setLoading(true);
      const togglePromises = Array.from(selectedFeedRows).map(feedId => 
        api.toggleFeed(feedId)
      );

      const results = await Promise.allSettled(togglePromises);
      const succeeded = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (succeeded > 0) {
        showMessage(`Successfully ${action}d ${succeeded} feed${succeeded !== 1 ? 's' : ''}`, 'success');
        fetchFeeds();
        fetchStats();
      }

      if (failed > 0) {
        showMessage(`Failed to ${action} ${failed} feed${failed !== 1 ? 's' : ''}`, 'error');
      }

      setSelectedFeedRows(new Set());
      setSelectAllFeeds(false);
    } catch (error: any) {
      console.error(`Error bulk ${action}ing feeds:`, error);
      showMessage(error?.message || `Failed to ${action} selected feeds`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="skote-page-title">
            Feed Sources
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage RSS feed sources for article collection
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowAddModal(true)} className="w-32 whitespace-nowrap bg-yellow-500 hover:bg-yellow-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Feed
            </Button>
            <Button 
              onClick={handleFetchArticles} 
              disabled={fetchingArticles}
              className="w-40 whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className={cn('w-4 h-4 mr-2', fetchingArticles && 'animate-spin')} />
              {fetchingArticles ? 'Fetching...' : 'Fetch active'}
            </Button>
            <Button 
              onClick={handleFetchTest} 
              disabled={fetchingTest}
              className="w-48 whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Download className={cn("w-4 h-4 mr-2", fetchingTest && "animate-spin")} />
              {fetchingTest ? "Testing..." : "Fetch active (TEST)"}
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-muted rounded-lg p-1 space-x-1">
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('table')}
                className="w-32 whitespace-nowrap"
              >
                <Rss className="w-4 h-4 mr-2" />
                Feed data
              </Button>
              <Button
                variant={currentView === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('stats')}
                className="w-32 whitespace-nowrap"
              >
                <Eye className="w-4 h-4 mr-2" />
                Fetching details
              </Button>
            </div>
            <Button variant="outline" onClick={fetchFeeds} disabled={loading} className="w-10 h-10 p-0 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300">
              <RefreshCw className={cn('w-5 h-5 text-blue-600', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-destructive mr-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-success mr-2" />
            <p className="text-sm text-success">{success}</p>
          </div>
        </div>
      )}

      {/* Stats View */}
      {currentView === 'stats' && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rss className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.overview?.total_feeds || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Feeds</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.overview?.enabled_feeds || 0}</p>
                  <p className="text-sm text-muted-foreground">Enabled Feeds</p>
                </div>
              </div>
            </div>
          </div>


          {/* Feed Fetch Logs Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-1">Feed Fetch Logs</h3>
              <p className="text-sm text-muted-foreground">View and manage logs of RSS feed data fetches.</p>

              {/* Search and Filters */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="search"
                    placeholder="Search logs by ID or fetching number"
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <select
                  value={logsStatus}
                  onChange={(e) => setLogsStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Loading logs...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">ID</th>
                      <th className="px-6 py-3 text-left font-medium">Fetching Number</th>
                      <th className="px-6 py-3 text-left font-medium">Started At</th>
                      <th className="px-6 py-3 text-left font-medium">Completed At</th>
                      <th className="px-6 py-3 text-center font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Total</th>
                      <th className="px-6 py-3 text-right font-medium">Valid</th>
                      <th className="px-6 py-3 text-right font-medium">Invalid</th>
                      <th className="px-6 py-3 text-center font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {feedFetchLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                          No fetch logs found
                        </td>
                      </tr>
                    ) : (
                      feedFetchLogs.map((log) => {
                        const getStatusBadge = (status: string) => {
                          const statusClasses = {
                            completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                            failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          };
                          return statusClasses[status as keyof typeof statusClasses] || statusClasses.pending;
                        };

                        const formatDate = (dateString: string) => {
                          return new Date(dateString).toLocaleString('pl-PL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        };

                        return (
                          <tr key={log.id} className="hover:bg-muted/30">
                            <td className="px-6 py-4 font-mono text-xs">{log.id}</td>
                            <td className="px-6 py-4">{log.fetching_number}</td>
                            <td className="px-6 py-4">{formatDate(log.started_at)}</td>
                            <td className="px-6 py-4">{log.completed_at ? formatDate(log.completed_at) : '-'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">{log.total_feeds || 0}</td>
                            <td className="px-6 py-4 text-right text-green-600">{log.valid_feeds || 0}</td>
                            <td className="px-6 py-4 text-right text-red-600">{log.invalid_feeds || 0}</td>
                            <td className="px-6 py-4 text-center">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
              </table>
            </div>
            )}

            {/* Pagination */}
            {logsTotalPages > 1 && (
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {logsPage} of {logsTotalPages}
                </div>
                <nav className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setLogsPage(Math.max(1, logsPage - 1))}
                    disabled={logsPage <= 1}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>

                  {Array.from({ length: Math.min(5, logsTotalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === logsPage ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setLogsPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {logsTotalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setLogsPage(logsTotalPages)}
                      >
                        {logsTotalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setLogsPage(Math.min(logsTotalPages, logsPage + 1))}
                    disabled={logsPage >= logsTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>

          {/* Fetch Logs Section */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsWorkflowCallsExpanded(!isWorkflowCallsExpanded)}
                  className="flex items-center text-lg font-medium text-foreground hover:text-foreground/80 transition-colors"
                >
                  {isWorkflowCallsExpanded ? (
                    <ChevronDown className="w-5 h-5 mr-1" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-1" />
                  )}
                  Run workflow calls
                </button>
              </div>
              {fetchLogs.length > 0 && isWorkflowCallsExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFetchLogs}
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  title="Clear all fetch logs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Logs
                </Button>
              )}
            </div>
            {isWorkflowCallsExpanded && (
              fetchLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No fetch operations logged yet.</p>
              ) : (
                <div className="space-y-3">
                {fetchLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          log.status === 'success' ? 'bg-green-500' :
                          log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        )} />
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{log.user}</span>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {log.status.toUpperCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedLogs);
                          if (expandedLogs.has(log.id)) {
                            newExpanded.delete(log.id);
                          } else {
                            newExpanded.add(log.id);
                          }
                          setExpandedLogs(newExpanded);
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {expandedLogs.has(log.id) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                    </div>

                    {expandedLogs.has(log.id) && (
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        {/* Request to Backend Section */}
                        <div>
                          <button
                            onClick={() => toggleLogSection(log.id, 'request')}
                            className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                          >
                            {isLogSectionExpanded(log.id, 'request') ? (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-1" />
                            )}
                            Request to Backend:
                          </button>
                          {isLogSectionExpanded(log.id, 'request') && (
                            <pre className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-orange-200 dark:border-orange-800">
                              {JSON.stringify(log.request, null, 2)}
                            </pre>
                          )}
                        </div>
                        
                        {/* Request to N8N Section */}
                        {log.response && log.response.webhookPayload && (
                          <div>
                            <button
                              onClick={() => toggleLogSection(log.id, 'webhook')}
                              className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                            >
                              {isLogSectionExpanded(log.id, 'webhook') ? (
                                <ChevronDown className="w-4 h-4 mr-1" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-1" />
                              )}
                              Request to N8N:
                            </button>
                            {isLogSectionExpanded(log.id, 'webhook') && (
                              <pre className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-blue-200 dark:border-blue-800">
                                {JSON.stringify(log.response.webhookPayload, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                        
                        {/* Response Section */}
                        {log.response && (
                          <div>
                            <button
                              onClick={() => toggleLogSection(log.id, 'response')}
                              className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                            >
                              {isLogSectionExpanded(log.id, 'response') ? (
                                <ChevronDown className="w-4 h-4 mr-1" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-1" />
                              )}
                              Response:
                            </button>
                            {isLogSectionExpanded(log.id, 'response') && (
                              <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-red-200 dark:border-red-800">
                                {JSON.stringify(log.response, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}

                        {/* Error Section */}
                        {log.error && (
                          <div>
                            <button
                              onClick={() => toggleLogSection(log.id, 'error')}
                              className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                            >
                              {isLogSectionExpanded(log.id, 'error') ? (
                                <ChevronDown className="w-4 h-4 mr-1" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-1" />
                              )}
                              Error:
                            </button>
                            {isLogSectionExpanded(log.id, 'error') && (
                              <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700">
                                {log.error}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {currentView === 'table' && (
        <>
          {/* Filters */}
          <div className="mb-6 bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search feeds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Actions
            </label>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setDebouncedSearch('');
                setTypeFilter('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="w-full h-[42px] py-2"
            >
              <X className="w-3.5 h-3.5 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Feeds Table */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        {loading && feeds.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading feeds...</span>
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Rss className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No feeds found
            </h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first RSS feed source.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Feed
            </Button>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {selectedFeedRows.size > 0 && (
              <div className="px-4 py-3 bg-primary/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-foreground font-medium">
                      {selectedFeedRows.size} feed{selectedFeedRows.size !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFeedRows(new Set());
                        setSelectAllFeeds(false);
                      }}
                      className="h-8"
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBulkFetchFeeds}
                      disabled={fetchingArticles}
                      className="h-8 bg-green-600 hover:bg-green-700"
                    >
                      <Download className={cn('w-3 h-3 mr-1', fetchingArticles && 'animate-spin')} />
                      Fetch Selected
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleBulkToggleFeeds(true)}
                      className="h-8 bg-blue-600 hover:bg-blue-700"
                    >
                      <Power className="w-3 h-3 mr-1" />
                      Toggle Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDeleteFeeds}
                      className="h-8"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectAllFeeds}
                        onChange={(e) => handleSelectAllFeeds(e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                      />
                    </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Feed</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      {getSortIcon('type')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort('domain_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Domain</span>
                      {getSortIcon('domain_name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort('enabled')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('enabled')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {feeds.map((feed) => (
                  <tr key={feed.id} className={cn(
                    "hover:bg-muted/50",
                    !feed.enabled && "bg-gray-100/50 dark:bg-gray-800/50 opacity-60"
                  )}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFeedRows.has(feed.id)}
                        onChange={(e) => handleSelectFeedRow(feed.id, e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          feed.enabled ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {feed.name}
                        </p>
                        <p className={cn(
                          "text-xs truncate",
                          feed.enabled ? "text-muted-foreground" : "text-muted-foreground/60"
                        )}>
                          {feed.url}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {feed.type && (
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                          feed.enabled
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted/50 text-muted-foreground border-muted-foreground/20"
                        )}>
                          {feed.type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {feed.domain_name ? (
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                          feed.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                            : "bg-muted/50 text-muted-foreground border-muted-foreground/20"
                        )}>
                          {feed.domain_name}
                        </span>
                      ) : (
                        <span className={cn(
                          "text-sm",
                          feed.enabled ? "text-muted-foreground" : "text-muted-foreground/60"
                        )}>No domain</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(feed.enabled, feed.error_count)}`}>
                        {feed.enabled ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {getStatusText(feed.enabled, feed.error_count)}
                      </span>
                      {feed.error_count > 0 && (
                        <div className="text-xs text-error mt-1">
                          {feed.error_count} errors
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeed(feed.id)}
                          className={cn(
                            'h-8 w-8 p-0',
                            feed.enabled ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'
                          )}
                          title={feed.enabled ? 'Disable feed' : 'Enable feed'}
                        >
                          {feed.enabled ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:text-blue-700 hover:bg-muted transition-colors"
                          title="Open feed URL in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(feed)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                          title="Edit this feed"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFeed(feed.id, feed.name)}
                          className="h-8 w-8 p-0 text-error hover:text-error/80"
                          title="Delete feed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

        </>
      )}

      {/* Pagination - only show for table view */}
      {currentView === 'table' && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Feed Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {editingFeed ? 'Edit Feed' : 'Add New Feed'}
              </h3>
              <button
                onClick={closeModals}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Feed display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://example.com/feed.xml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Domain *
                </label>
                <select
                  required
                  value={formData.domain_id}
                  onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a domain</option>
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Technology, News"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Brief description of this feed"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-foreground">
                  Enable this feed
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModals}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingFeed ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Feed Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview Stats */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.overview.total_feeds}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">Total Feeds</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.overview.enabled_feeds}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200">Enabled</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.overview.disabled_feeds}
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-200">Disabled</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.overview.error_feeds}
                    </div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">With Errors</div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {stats.types.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">By Type</h4>
                  <div className="space-y-2">
                    {stats.types.map((cat) => (
                      <div key={cat.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{cat.type}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {cat.count} total
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {cat.enabled_count} enabled
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedManagement;