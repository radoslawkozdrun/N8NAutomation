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
} from 'lucide-react';
import Button from './ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
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
      if (search) filters.search = search;
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

  useEffect(() => {
    fetchFeeds();
    fetchStats();
    fetchTypes();
    fetchDomains();
  }, [page, search, typeFilter, statusFilter, sortBy, sortOrder]);

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

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Feed Sources
          </h1>
          <p className="text-muted-foreground">
            Manage RSS feed sources for article collection
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={() => setShowAddModal(true)} className="w-32 whitespace-nowrap bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Feed
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-muted rounded-lg p-1 space-x-1">
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('table')}
                className="w-32 whitespace-nowrap"
              >
                Table
              </Button>
              <Button
                variant={currentView === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('stats')}
                className="w-32 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </Button>
            </div>
            <Button variant="outline" onClick={fetchFeeds} disabled={loading} className="w-32 whitespace-nowrap">
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              Refresh
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.overview?.error_feeds || 0}</p>
                  <p className="text-sm text-muted-foreground">Error Feeds</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.overview?.checked_feeds || 0}</p>
                  <p className="text-sm text-muted-foreground">Checked Feeds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Types Distribution */}
          {stats?.types && stats.types.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-4">Feed Types Distribution</h3>
              <div className="space-y-3">
                {stats.types.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{type.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">{type.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({type.enabled_count} enabled)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {currentView === 'table' && (
        <>
          {/* Filters */}
          <div className="mb-6 bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="w-full"
            >
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
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
                  <tr key={feed.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-foreground truncate">
                          {feed.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {feed.url}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {feed.type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {feed.type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {feed.domain_name ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
                          {feed.domain_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No domain</span>
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
}