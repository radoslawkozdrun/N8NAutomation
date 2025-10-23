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
import Button from './ui/Button';
import DataTable, { Column } from './ui/DataTable';
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
  categories: Array<{
    name: string;
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
  target_audiences: string[];
  priority_examples: {
    P0: string;
    P1: string;
  };
  domain_specific_terms: string;
  translations: string[];
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

  const toggleCategoryExpansion = (categoryIndex: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryIndex)) {
      newExpanded.delete(categoryIndex);
    } else {
      newExpanded.add(categoryIndex);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="skote-page-title">
            Domain Management
          </h1>
          <p className="text-muted-foreground mt-2">
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
      {loading && domains.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading domains...</span>
          </div>
        </div>
      ) : domains.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Globe className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No domains found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first domain configuration.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Domain
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'domain_name',
              label: 'Domain',
              sortable: true,
              render: (value, row) => (
                <div className="max-w-sm">
                  <div className="text-sm font-medium text-gray-900">
                    {row.domain_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {row.domain_id}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {row.config.target_persona}
                  </div>
                </div>
              )
            },
            {
              key: 'is_active',
              label: 'Status',
              sortable: true,
              render: (value) => (
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {value ? 'Active' : 'Inactive'}
                </span>
              )
            },
            {
              key: 'version',
              label: 'Version',
              sortable: true,
              render: (value) => (
                <span className="text-sm text-gray-700">v{value}</span>
              )
            },
            {
              key: 'updated_at',
              label: 'Last Updated',
              sortable: true,
              render: (value) => (
                <span className="text-sm text-gray-700">
                  {new Date(value).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              className: 'text-center',
              headerClassName: 'text-center',
              render: (_, row) => (
                <div className="flex items-center justify-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDomain(row.id)}
                    iconName={row.is_active ? 'Power' : 'PowerOff'}
                    iconSize={14}
                    title={row.is_active ? 'Deactivate domain' : 'Activate domain'}
                    className={row.is_active ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('View button clicked for domain:', row.id, row.domain_name);
                      openViewModal(row);
                    }}
                    iconName="Eye"
                    iconSize={14}
                    title="View configuration"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked for domain:', row.id, row.domain_name);
                      openEditModal(row);
                    }}
                    iconName="Edit2"
                    iconSize={14}
                    title="Edit domain"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDomain(row.id, row.domain_name)}
                    iconName="Trash2"
                    iconSize={14}
                    title="Delete domain"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  />
                </div>
              )
            }
          ]}
          data={domains}
          keyField="id"
          initialColumnWidths={{
            domain_name: 300,
            is_active: 120,
            version: 100,
            updated_at: 150,
            actions: 200
          }}
          storageKey="domain-management-column-widths"
          emptyMessage="No domains found"
        />
      )}

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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">🌐 Domain Identity</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Domain ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-white dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      {viewingDomain.domain_id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Target Persona
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      {viewingDomain.config.target_persona}
                    </p>
                  </div>
                  {viewingDomain.config.translations && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        🌍 Supported Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {viewingDomain.config.translations.map((lang, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    📂 Categories ({viewingDomain.config.categories.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {viewingDomain.config.categories.map((category, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded">
                      <button
                        onClick={() => toggleCategoryExpansion(index.toString())}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </span>
                        {expandedCategories.has(index.toString()) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedCategories.has(index.toString()) && (
                        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <Badge key={subIndex} className="text-xs">
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
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    👥 Target Audiences
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewingDomain.config.target_audiences.map((audience, index) => (
                    <Badge key={index} className="text-sm">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Scoring Criteria */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    🎯 Scoring Criteria
                  </h4>
                </div>
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

  const updateCategories = (categories: Array<{name: string; subcategories: string[]}>) => {
    updateConfig({ categories });
  };

  const addCategory = () => {
    const currentCategories = formData.config?.categories || [];
    const updatedCategories = [
      ...currentCategories,
      {
        name: 'New Category',
        subcategories: []
      }
    ];
    updateCategories(updatedCategories);
  };

  const removeCategory = (categoryIndex: number) => {
    const currentCategories = [...(formData.config?.categories || [])];
    currentCategories.splice(categoryIndex, 1);
    updateCategories(currentCategories);
  };

  const updateCategory = (categoryIndex: number, updates: any) => {
    const currentCategories = [...(formData.config?.categories || [])];
    currentCategories[categoryIndex] = {
      ...currentCategories[categoryIndex],
      ...updates
    };
    updateCategories(currentCategories);
  };

  const addSubcategory = (categoryIndex: number, subcategory: string) => {
    const currentCategories = [...(formData.config?.categories || [])];
    const category = currentCategories[categoryIndex];
    if (category && subcategory.trim()) {
      category.subcategories = [...(category.subcategories || []), subcategory.trim()];
      updateCategories(currentCategories);
    }
  };

  const removeSubcategory = (categoryIndex: number, subIndex: number) => {
    const currentCategories = [...(formData.config?.categories || [])];
    const category = currentCategories[categoryIndex];
    if (category) {
      category.subcategories.splice(subIndex, 1);
      updateCategories(currentCategories);
    }
  };

  const updateTargetAudiences = (audiences: string[]) => {
    updateConfig({ target_audiences: audiences });
  };

  const addAudience = () => {
    const currentAudiences = formData.config?.target_audiences || [];
    updateTargetAudiences([
      ...currentAudiences,
      'New Audience'
    ]);
  };

  const updateAudience = (index: number, value: string) => {
    const currentAudiences = [...(formData.config?.target_audiences || [])];
    currentAudiences[index] = value;
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
              { key: 'basic', label: '🌐 Basic Info', color: 'blue' },
              { key: 'categories', label: '📂 Categories', color: 'purple' },
              { key: 'persona', label: '🎯 Criteria', color: 'emerald' },
              { key: 'audiences', label: '👥 Audiences', color: 'amber' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-4 border-b-3 font-semibold text-sm mr-6 rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.key
                    ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400 bg-${tab.color}-50 dark:bg-${tab.color}-900/20 shadow-sm`
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
              <div className="space-y-6">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">🌐 Domain Identity</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        Domain ID
                      </label>
                      <input
                        type="text"
                        value={formData.domain_id}
                        onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 font-mono text-sm focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                        placeholder="e.g., artificial_intelligence"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Domain Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.domain_name}
                        onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                        placeholder="Display name for the domain"
                      />
                    </div>
                  </div>
                </div>

                {/* Persona Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                    <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">👤 Target Persona</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Who is your target audience?
                    </label>
                    <input
                      type="text"
                      value={formData.config?.target_persona || ''}
                      onChange={(e) => updateConfig({ target_persona: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
                      placeholder="e.g., AI/ML specialist, fellow developer, automotive enthusiast"
                    />
                  </div>
                </div>

                {/* Expertise Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">🧠 Domain Expertise</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      Describe your domain expertise
                    </label>
                    <textarea
                      rows={4}
                      value={formData.config?.domain_expertise || ''}
                      onChange={(e) => updateConfig({ domain_expertise: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors resize-none"
                      placeholder="Brief description of the domain expertise, key areas of knowledge, and technical focus..."
                    />
                  </div>
                </div>

                {/* Terms & Languages Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
                      <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">🏷️ Key Terms</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                        Domain-specific terminology
                      </label>
                      <textarea
                        rows={3}
                        value={formData.config?.domain_specific_terms || ''}
                        onChange={(e) => updateConfig({ domain_specific_terms: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-amber-400 dark:focus:border-amber-500 transition-colors resize-none"
                        placeholder="models, algorithms, frameworks, tools..."
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-rose-100 dark:border-rose-800">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-rose-500 rounded-full mr-3 animate-pulse"></div>
                      <h4 className="text-lg font-semibold text-rose-900 dark:text-rose-100">🌍 Languages</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">
                        Supported translations
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(formData.config?.translations || ['pl']).map((lang, index) => (
                          <div key={index} className="flex items-center bg-white dark:bg-gray-700 rounded-lg border-2 border-rose-200 dark:border-rose-700 px-3 py-2">
                            <input
                              type="text"
                              value={lang}
                              onChange={(e) => {
                                const newTranslations = [...(formData.config?.translations || [])];
                                newTranslations[index] = e.target.value;
                                updateConfig({ translations: newTranslations });
                              }}
                              className="w-16 text-center bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 font-mono text-sm"
                              placeholder="pl"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newTranslations = [...(formData.config?.translations || [])];
                                newTranslations.splice(index, 1);
                                updateConfig({ translations: newTranslations });
                              }}
                              className="ml-2 text-rose-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newTranslations = [...(formData.config?.translations || []), 'en'];
                            updateConfig({ translations: newTranslations });
                          }}
                          className="flex items-center justify-center w-10 h-10 bg-rose-100 dark:bg-rose-900/30 border-2 border-dashed border-rose-300 dark:border-rose-600 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${formData.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">⚡ Domain Status</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enable or disable this domain configuration</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-6 w-6 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                      />
                      <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </div>
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
                  {(formData.config?.categories || []).map((category, index) => (
                    <CategoryEditor
                      key={index}
                      categoryIndex={index}
                      category={category}
                      onUpdate={(updates) => updateCategory(index, updates)}
                      onRemove={() => removeCategory(index)}
                      onAddSubcategory={(subcategory) => addSubcategory(index, subcategory)}
                      onRemoveSubcategory={(subIndex) => removeSubcategory(index, subIndex)}
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
                  {(formData.config?.target_audiences || []).map((audience: string, index: number) => (
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Audience Name
                        </label>
                        <input
                          type="text"
                          value={audience}
                          onChange={(e) => updateAudience(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          placeholder="e.g., Junior Developers"
                        />
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
  categoryIndex: number;
  category: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onAddSubcategory: (subcategory: string) => void;
  onRemoveSubcategory: (index: number) => void;
}

function CategoryEditor({
  categoryIndex,
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
          Category {categoryIndex + 1}
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
            Category Name
          </label>
          <input
            type="text"
            value={category.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
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