import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Search,
  Filter,
  RefreshCw,
  Save,
  X,
  Eye,
  BarChart3,
  Code,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Domain {
  id: number;
  domain_id: string;
  domain_name: string;
  config: DomainConfig;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
}

interface DomainConfig {
  categories: Record<string, {
    name: string;
    description: string;
    subcategories: string[];
  }>;
  target_persona: string;
  domain_expertise: string;
  scoring_criteria: {
    value: string;
    viral: string;
    novelty: string;
    relevance: string;
  };
  target_audiences: Array<{
    code: string;
    name: string;
    description: string;
  }>;
  priority_examples: {
    P0: string;
    P1: string;
  };
  domain_specific_terms: string;
}

interface DomainStats {
  overview: {
    total_domains: number;
    active_domains: number;
    inactive_domains: number;
    avg_version: number;
  };
  domains: Array<{
    domain_name: string;
    feed_count: number;
    active_feeds: number;
  }>;
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<DomainStats | null>(null);

  // Filters and pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [viewingDomain, setViewingDomain] = useState<Domain | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    domain_id: '',
    domain_name: '',
    config: {} as DomainConfig,
    is_active: true
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

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (search) filters.search = search;
      if (statusFilter !== 'all') filters.active = statusFilter === 'active';

      const response = await api.getDomains(filters, page, 20);
      setDomains(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (error: any) {
      console.error('Error fetching domains:', error);
      if (error?.status === 401) {
        showMessage('Authentication failed - please log in again', 'error');
        localStorage.removeItem('authToken');
      } else {
        showMessage(error?.message || 'Failed to load domains', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getDomainStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchDomains();
    fetchStats();
  }, [page, search, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting domain form with data:', formData, 'editingDomain:', editingDomain);

    if (!formData.domain_id || !formData.domain_name) {
      showMessage('Domain ID and name are required', 'error');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editingDomain) {
        console.log('Updating domain with ID:', editingDomain.id);
        response = await api.updateDomain(editingDomain.id, formData);
      } else {
        console.log('Creating new domain');
        response = await api.createDomain(formData);
      }
      
      console.log('Domain API response:', response);
      showMessage(response.message || `Domain ${editingDomain ? 'updated' : 'created'} successfully`, 'success');
      closeModals();
      fetchDomains();
      fetchStats();
    } catch (error: any) {
      console.error('Error submitting domain form:', error);
      showMessage(error?.message || 'Failed to save domain', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDomain = async (id: number) => {
    try {
      const response = await api.toggleDomain(id);
      showMessage(response.message, 'success');
      fetchDomains();
      fetchStats();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to toggle domain', 'error');
    }
  };

  const deleteDomain = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await api.deleteDomain(id);
      showMessage(response.message, 'success');
      fetchDomains();
      fetchStats();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to delete domain', 'error');
    }
  };

  const openEditModal = (domain: Domain) => {
    console.log('Opening edit modal for domain:', domain);
    console.log('Current showEditModal state:', showEditModal);
    setEditingDomain(domain);
    setFormData({
      domain_id: domain.domain_id,
      domain_name: domain.domain_name,
      config: domain.config,
      is_active: domain.is_active
    });
    setShowEditModal(true);
    console.log('Setting showEditModal to true');
  };

  const openViewModal = (domain: Domain) => {
    setViewingDomain(domain);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowStatsModal(false);
    setEditingDomain(null);
    setViewingDomain(null);
    setFormData({
      domain_id: '',
      domain_name: '',
      config: {} as DomainConfig,
      is_active: true
    });
  };

  const getStatusBadgeColor = (is_active: boolean) => {
    return is_active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const toggleCategoryExpansion = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Domain Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage content domains and their configurations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowStatsModal(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button>
          <Button variant="outline" onClick={fetchDomains} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <Save className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
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

      {/* Domains Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && domains.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600 dark:text-gray-400">Loading domains...</span>
          </div>
        ) : domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No domains found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get started by adding your first domain configuration.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Domain
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="max-w-sm">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {domain.domain_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {domain.domain_id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {domain.config.target_persona}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusBadgeColor(domain.is_active)}>
                        {domain.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      v{domain.version}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(domain.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleDomain(domain.id)}
                          className={cn(
                            'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
                            domain.is_active ? 'text-green-600' : 'text-gray-400'
                          )}
                          title={domain.is_active ? 'Deactivate domain' : 'Activate domain'}
                        >
                          {domain.is_active ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            console.log('View button clicked for domain:', domain.id, domain.domain_name);
                            openViewModal(domain);
                          }}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
                          title="View configuration"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Edit button clicked for domain:', domain.id, domain.domain_name);
                            openEditModal(domain);
                          }}
                          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 border border-transparent hover:border-green-300"
                          title="Edit this domain"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteDomain(domain.id, domain.domain_name)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                          title="Delete domain"
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

      {/* View Domain Modal */}
      {showViewModal && viewingDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {viewingDomain.domain_name} Configuration
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {viewingDomain.domain_id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Persona
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {viewingDomain.config.target_persona}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Categories ({Object.keys(viewingDomain.config.categories).length})
                </h4>
                <div className="space-y-2">
                  {Object.entries(viewingDomain.config.categories).map(([key, category]) => (
                    <div key={key} className="border border-gray-200 dark:border-gray-700 rounded">
                      <button
                        onClick={() => toggleCategoryExpansion(key)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </span>
                        {expandedCategories.has(key) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedCategories.has(key) && (
                        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {category.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.map((sub, index) => (
                              <Badge key={index} className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audiences */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Target Audiences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {viewingDomain.config.target_audiences.map((audience) => (
                    <div key={audience.code} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {audience.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {audience.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring Criteria */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Scoring Criteria
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(viewingDomain.config.scoring_criteria).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">
                        {key}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Domain Statistics
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
                      {stats.overview.total_domains}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">Total Domains</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.overview.active_domains}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200">Active</div>
                  </div>
                </div>
              </div>

              {/* Domain Feed Counts */}
              {stats.domains.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Feed Distribution</h4>
                  <div className="space-y-2">
                    {stats.domains.map((domain) => (
                      <div key={domain.domain_name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{domain.domain_name}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {domain.feed_count} feeds
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {domain.active_feeds} active
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

      {/* Edit Domain Modal */}
      {showEditModal && editingDomain && (
        <DomainEditModal
          domain={editingDomain}
          isOpen={showEditModal}
          onClose={closeModals}
          onSave={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
        />
      )}
    </div>
  );
}

// Domain Edit Modal Component
interface DomainEditModalProps {
  domain: Domain;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  loading: boolean;
}

function DomainEditModal({ 
  domain, 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  loading 
}: DomainEditModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'categories' | 'persona' | 'audiences'>('basic');

  if (!isOpen) return null;

  const updateConfig = (updates: Partial<DomainConfig>) => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        ...updates
      }
    });
  };

  const updateScoringCriteria = (key: string, value: string) => {
    updateConfig({
      scoring_criteria: {
        ...formData.config?.scoring_criteria,
        [key]: value
      }
    });
  };

  const updateCategories = (categories: Record<string, any>) => {
    updateConfig({ categories });
  };

  const addCategory = () => {
    const newCategoryKey = `new_category_${Date.now()}`;
    const updatedCategories = {
      ...formData.config?.categories,
      [newCategoryKey]: {
        name: 'New Category',
        description: 'Description of the new category',
        subcategories: []
      }
    };
    updateCategories(updatedCategories);
  };

  const removeCategory = (categoryKey: string) => {
    const updatedCategories = { ...formData.config?.categories };
    delete updatedCategories[categoryKey];
    updateCategories(updatedCategories);
  };

  const updateCategory = (categoryKey: string, updates: any) => {
    const updatedCategories = {
      ...formData.config?.categories,
      [categoryKey]: {
        ...formData.config?.categories[categoryKey],
        ...updates
      }
    };
    updateCategories(updatedCategories);
  };

  const addSubcategory = (categoryKey: string, subcategory: string) => {
    const category = formData.config?.categories[categoryKey];
    if (category && subcategory.trim()) {
      updateCategory(categoryKey, {
        subcategories: [...(category.subcategories || []), subcategory.trim()]
      });
    }
  };

  const removeSubcategory = (categoryKey: string, index: number) => {
    const category = formData.config?.categories[categoryKey];
    if (category) {
      const updatedSubcategories = [...category.subcategories];
      updatedSubcategories.splice(index, 1);
      updateCategory(categoryKey, { subcategories: updatedSubcategories });
    }
  };

  const updateTargetAudiences = (audiences: Array<{code: string; name: string; description: string}>) => {
    updateConfig({ target_audiences: audiences });
  };

  const addAudience = () => {
    const currentAudiences = formData.config?.target_audiences || [];
    updateTargetAudiences([
      ...currentAudiences,
      {
        code: 'new_audience',
        name: 'New Audience',
        description: 'Description of the new audience'
      }
    ]);
  };

  const updateAudience = (index: number, updates: any) => {
    const currentAudiences = [...(formData.config?.target_audiences || [])];
    currentAudiences[index] = { ...currentAudiences[index], ...updates };
    updateTargetAudiences(currentAudiences);
  };

  const removeAudience = (index: number) => {
    const currentAudiences = [...(formData.config?.target_audiences || [])];
    currentAudiences.splice(index, 1);
    updateTargetAudiences(currentAudiences);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Edit Domain: {domain.domain_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex px-6">
            {[
              { key: 'basic', label: 'Basic Info' },
              { key: 'categories', label: 'Categories' },
              { key: 'persona', label: 'Persona & Criteria' },
              { key: 'audiences', label: 'Target Audiences' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm mr-8 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={onSave}>
          <div className="p-6 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain ID
                  </label>
                  <input
                    type="text"
                    value={formData.domain_id}
                    onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., artificial_intelligence"
                    disabled // Don't allow changing domain_id when editing
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.domain_name}
                    onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Display name for the domain"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Persona
                  </label>
                  <input
                    type="text"
                    value={formData.config?.target_persona || ''}
                    onChange={(e) => updateConfig({ target_persona: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., AI/ML specialist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain Expertise
                  </label>
                  <textarea
                    rows={3}
                    value={formData.config?.domain_expertise || ''}
                    onChange={(e) => updateConfig({ domain_expertise: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Brief description of the domain expertise..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain Specific Terms
                  </label>
                  <textarea
                    rows={2}
                    value={formData.config?.domain_specific_terms || ''}
                    onChange={(e) => updateConfig({ domain_specific_terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Comma-separated terms relevant to this domain..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Active domain
                  </label>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Categories</h4>
                  <Button type="button" onClick={addCategory} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-4">
                  {Object.entries(formData.config?.categories || {}).map(([categoryKey, category]: [string, any]) => (
                    <CategoryEditor
                      key={categoryKey}
                      categoryKey={categoryKey}
                      category={category}
                      onUpdate={(updates) => updateCategory(categoryKey, updates)}
                      onRemove={() => removeCategory(categoryKey)}
                      onAddSubcategory={(subcategory) => addSubcategory(categoryKey, subcategory)}
                      onRemoveSubcategory={(index) => removeSubcategory(categoryKey, index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Persona & Criteria Tab */}
            {activeTab === 'persona' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Scoring Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.config?.scoring_criteria || {}).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                          {key}
                        </label>
                        <textarea
                          rows={3}
                          value={value}
                          onChange={(e) => updateScoringCriteria(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          placeholder={`How to evaluate ${key}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Priority Examples</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.config?.priority_examples || {}).map(([priority, example]: [string, any]) => (
                      <div key={priority}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {priority} Priority
                        </label>
                        <textarea
                          rows={3}
                          value={example}
                          onChange={(e) => updateConfig({
                            priority_examples: {
                              ...formData.config?.priority_examples,
                              [priority]: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          placeholder={`Examples of ${priority} priority content...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Target Audiences Tab */}
            {activeTab === 'audiences' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Target Audiences</h4>
                  <Button type="button" onClick={addAudience} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Audience
                  </Button>
                </div>

                <div className="space-y-4">
                  {(formData.config?.target_audiences || []).map((audience: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          Audience {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removeAudience(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Code
                          </label>
                          <input
                            type="text"
                            value={audience.code}
                            onChange={(e) => updateAudience(index, { code: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="e.g., developers"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={audience.name}
                            onChange={(e) => updateAudience(index, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="e.g., Developers"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={audience.description}
                            onChange={(e) => updateAudience(index, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="Description of this audience"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Update Domain
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Editor Component
interface CategoryEditorProps {
  categoryKey: string;
  category: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onAddSubcategory: (subcategory: string) => void;
  onRemoveSubcategory: (index: number) => void;
}

function CategoryEditor({
  categoryKey,
  category,
  onUpdate,
  onRemove,
  onAddSubcategory,
  onRemoveSubcategory
}: CategoryEditorProps) {
  const [newSubcategory, setNewSubcategory] = useState('');

  const handleAddSubcategory = () => {
    if (newSubcategory.trim()) {
      onAddSubcategory(newSubcategory);
      setNewSubcategory('');
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900 dark:text-gray-100">
          {categoryKey}
        </h5>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={category.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={category.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategories
          </label>
          <div className="space-y-2">
            {(category.subcategories || []).map((sub: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => {
                    const updated = [...category.subcategories];
                    updated[index] = e.target.value;
                    onUpdate({ subcategories: updated });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSubcategory(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="Add new subcategory..."
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}