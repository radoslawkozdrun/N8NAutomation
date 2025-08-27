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
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Feed {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  last_checked: string | null;
  error_count: number;
  last_error: string | null;
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
  categories: Array<{
    category: string;
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
  const [categories, setCategories] = useState<string[]>([]);

  // Filters and pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    enabled: true
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found - user may need to log in');
      return null;
    }
    return token;
  };

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        // Show mock data if not authenticated
        const mockFeeds = [
          {
            id: 1,
            name: 'Tech News RSS',
            url: 'https://techcrunch.com/feed/',
            description: 'Latest technology news and updates',
            category: 'Technology',
            enabled: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            last_checked: '2024-08-23T10:00:00Z',
            error_count: 0,
            last_error: null
          },
          {
            id: 2,
            name: 'Financial Times RSS',
            url: 'https://www.ft.com/rss/home',
            description: 'Financial and business news',
            category: 'Finance',
            enabled: false,
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            last_checked: null,
            error_count: 3,
            last_error: 'Connection timeout'
          }
        ];
        
        setFeeds(mockFeeds);
        setTotalPages(1);
        showMessage('Please log in to manage feeds - showing mock data', 'error');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { enabled: (statusFilter === 'enabled').toString() })
      });

      const response = await fetch(`http://localhost:8002/api/feeds?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFeeds(data.data);
        setTotalPages(data.pagination.total_pages);
      } else {
        if (response.status === 401 || response.status === 403) {
          showMessage('Authentication failed - please log in again', 'error');
          localStorage.removeItem('authToken');
        } else {
          showMessage(data.message || 'Failed to load feeds', 'error');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      showMessage('Network error - please check your connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Mock stats for unauthenticated users
        setStats({
          overview: {
            total_feeds: 2,
            enabled_feeds: 1,
            disabled_feeds: 1,
            checked_feeds: 1,
            error_feeds: 1,
            avg_error_count: 1.5
          },
          categories: [
            { category: 'Technology', count: 1, enabled_count: 1 },
            { category: 'Finance', count: 1, enabled_count: 0 }
          ]
        });
        return;
      }

      const response = await fetch('http://localhost:8002/api/feeds/meta/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      
      // Mock stats for development
      setStats({
        overview: {
          total_feeds: 2,
          enabled_feeds: 1,
          disabled_feeds: 1,
          checked_feeds: 1,
          error_feeds: 1,
          avg_error_count: 1.5
        },
        categories: [
          { category: 'Technology', count: 1, enabled_count: 1 },
          { category: 'Finance', count: 1, enabled_count: 0 }
        ]
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Mock categories for unauthenticated users
        setCategories(['Technology', 'Finance', 'News', 'Sports']);
        return;
      }

      const response = await fetch('http://localhost:8002/api/feeds/meta/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      
      // Mock categories for development
      setCategories(['Technology', 'Finance', 'News', 'Sports']);
    }
  };

  useEffect(() => {
    fetchFeeds();
    fetchStats();
    fetchCategories();
  }, [page, search, categoryFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url) {
      showMessage('Name and URL are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingFeed 
        ? `http://localhost:8002/api/feeds/${editingFeed.id}`
        : 'http://localhost:8002/api/feeds';
      
      const method = editingFeed ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage(data.message || `Feed ${editingFeed ? 'updated' : 'created'} successfully`, 'success');
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingFeed(null);
        setFormData({ name: '', url: '', description: '', category: '', enabled: true });
        fetchFeeds();
        fetchStats();
        fetchCategories();
      } else {
        showMessage(data.message || 'Failed to save feed', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeed = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8002/api/feeds/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage(data.message, 'success');
        fetchFeeds();
        fetchStats();
      } else {
        showMessage(data.message || 'Failed to toggle feed', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    }
  };

  const deleteFeed = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8002/api/feeds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage(data.message, 'success');
        fetchFeeds();
        fetchStats();
        fetchCategories();
      } else {
        showMessage(data.message || 'Failed to delete feed', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    }
  };

  const openEditModal = (feed: Feed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      url: feed.url,
      description: feed.description || '',
      category: feed.category || '',
      enabled: feed.enabled
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowStatsModal(false);
    setEditingFeed(null);
    setFormData({ name: '', url: '', description: '', category: '', enabled: true });
  };

  const getStatusBadgeColor = (enabled: boolean, errorCount: number) => {
    if (!enabled) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
    if (errorCount > 0) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getStatusText = (enabled: boolean, errorCount: number) => {
    if (!enabled) return 'Disabled';
    if (errorCount > 0) return 'Errors';
    return 'Active';
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Feed Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage RSS feed sources for article collection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowStatsModal(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button>
          <Button variant="outline" onClick={fetchFeeds} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feed
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search feeds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                setCategoryFilter('');
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
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && feeds.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600 dark:text-gray-400">Loading feeds...</span>
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Rss className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No feeds found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Feed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {feeds.map((feed) => (
                  <tr key={feed.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="max-w-sm">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {feed.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {feed.url}
                        </div>
                        {feed.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                            {feed.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {feed.category && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {feed.category}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusBadgeColor(feed.enabled, feed.error_count)}>
                        {getStatusText(feed.enabled, feed.error_count)}
                      </Badge>
                      {feed.error_count > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {feed.error_count} errors
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {feed.last_checked 
                        ? new Date(feed.last_checked).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleFeed(feed.id)}
                          className={cn(
                            'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
                            feed.enabled ? 'text-green-600' : 'text-gray-400'
                          )}
                          title={feed.enabled ? 'Disable feed' : 'Enable feed'}
                        >
                          {feed.enabled ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
                          title="Open feed URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => openEditModal(feed)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                          title="Edit feed"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteFeed(feed.id, feed.name)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                          title="Delete feed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {editingFeed ? 'Edit Feed' : 'Add New Feed'}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Feed display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://example.com/feed.xml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Technology, News"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Brief description of this feed"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Feed Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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
              {stats.categories.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">By Category</h4>
                  <div className="space-y-2">
                    {stats.categories.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{cat.category}</span>
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