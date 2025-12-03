import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Download,
  Rss,
  Eye
} from 'lucide-react';
import Button from './ui/Button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useFeeds } from '@/hooks/useFeeds';
import { FeedStats } from './feed/FeedStats';
import { FeedTable } from './feed/FeedTable';
import { FeedLogs } from './feed/FeedLogs';
import { FeedModals } from './feed/FeedModals';
import { Feed, FeedFormData } from '@/types/feed';

export function FeedManagement() {
  const {
    feeds,
    loading,
    error,
    success,
    stats,
    types,
    domains,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    fetchLogs,
    feedFetchLogs,
    logsLoading,
    logsPage,
    setLogsPage,
    logsTotalPages,
    logsSearch,
    setLogsSearch,
    logsStatus,
    setLogsStatus,
    fetchFeedFetchLogs,
    fetchLogsFromServer,
    fetchFeeds,
    fetchStats,
    fetchTypes,
    showMessage
  } = useFeeds();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'stats'
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [fetchingArticles, setFetchingArticles] = useState(false);
  const [fetchingTest, setFetchingTest] = useState(false);

  // Bulk actions state
  const [selectedFeedRows, setSelectedFeedRows] = useState<Set<number>>(new Set());
  const [selectAllFeeds, setSelectAllFeeds] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FeedFormData>({
    name: '',
    url: '',
    description: '',
    type: '',
    enabled: true,
    domain_id: ''
  });

  // Load feed fetch logs when switching to stats view
  useEffect(() => {
    if (currentView === 'stats') {
      fetchFeedFetchLogs();
    }
  }, [currentView, fetchFeedFetchLogs]);

  // Clear selection when feeds change
  useEffect(() => {
    setSelectedFeedRows(new Set());
    setSelectAllFeeds(false);
  }, [feeds]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url) {
      showMessage('Name and URL are required', 'error');
      return;
    }

    if (!formData.domain_id) {
      showMessage('Domain is required', 'error');
      return;
    }

    try {
      let response;
      if (editingFeed) {
        response = await api.updateFeed(editingFeed.id, formData);
      } else {
        response = await api.createFeed(formData);
      }

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
    setEditingFeed(null);
    setFormData({ name: '', url: '', description: '', type: '', enabled: true, domain_id: '' });
  };

  const handleFetchArticles = async () => {
    try {
      setFetchingArticles(true);
      const response = await api.post('/webhook/fetch-feeds', {
        webhookType: 'production'
      });

      if (response.success) {
        toast.success(`Production webhook triggered! Processed ${response.feedsProcessed} feeds.`);
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
      const response = await api.post('/webhook/fetch-feeds', {
        webhookType: 'test'
      });

      if (response.success) {
        toast.success(`Test webhook triggered! Processed ${response.feedsProcessed} feeds.`);
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

  const clearFetchLogs = async () => {
    if (!confirm('Are you sure you want to clear all fetch logs? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.clearFetchLogs();
      if (response.success) {
        fetchLogsFromServer(); // Refresh logs
        showMessage('Fetch logs cleared successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to clear logs');
      }
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      showMessage(error?.message || 'Failed to clear logs', 'error');
    }
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
    setSelectAllFeeds(newSelection.size === feeds.length && feeds.length > 0);
  };

  const handleBulkFetchFeeds = async () => {
    if (selectedFeedRows.size === 0) {
      showMessage('Please select at least one feed to fetch', 'error');
      return;
    }

    try {
      setFetchingArticles(true);

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
          <FeedStats stats={stats} />
          <FeedLogs
            feedFetchLogs={feedFetchLogs}
            logsLoading={logsLoading}
            logsPage={logsPage}
            setLogsPage={setLogsPage}
            logsTotalPages={logsTotalPages}
            logsSearch={logsSearch}
            setLogsSearch={setLogsSearch}
            logsStatus={logsStatus}
            setLogsStatus={setLogsStatus}
            fetchLogs={fetchLogs}
            clearFetchLogs={clearFetchLogs}
          />
        </div>
      )}

      {/* Table View */}
      {currentView === 'table' && (
        <FeedTable
          feeds={feeds}
          loading={loading}
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          types={types}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          selectedFeedRows={selectedFeedRows}
          selectAllFeeds={selectAllFeeds}
          handleSelectAllFeeds={handleSelectAllFeeds}
          handleSelectFeedRow={handleSelectFeedRow}
          handleBulkFetchFeeds={handleBulkFetchFeeds}
          handleBulkToggleFeeds={handleBulkToggleFeeds}
          handleBulkDeleteFeeds={handleBulkDeleteFeeds}
          fetchingArticles={fetchingArticles}
          toggleFeed={toggleFeed}
          deleteFeed={deleteFeed}
          openEditModal={openEditModal}
          setShowAddModal={setShowAddModal}
          clearFilters={() => {
            setSearch('');
            setTypeFilter('');
            setStatusFilter('all');
            setPage(1);
          }}
        />
      )}

      {/* Add/Edit Feed Modal */}
      <FeedModals
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        editingFeed={editingFeed}
        closeModals={closeModals}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        domains={domains}
      />
    </div>
  );
}