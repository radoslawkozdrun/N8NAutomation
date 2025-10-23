import React, { useState, useEffect } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';
import { api } from '../../lib/api';
import { Article, ArticleFilters } from '../../types';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import FilterToolbar from './components/FilterToolbar';
import BulkActions from './components/BulkActions';
import ArticleTable from './components/ArticleTable';
import Pagination from './components/Pagination';
import { ToastContainer } from '../../components/ui/Toast';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  Clock,
  User,
  Tag,
  Star,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';

const ArticleList = () => {
  const navigate = useMockNavigate();
  const { success, error, warning } = useToast();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: 'created_at', direction: 'desc' as 'asc' | 'desc' });
  const [expandedRows, setExpandedRows] = useState<number[]>([]);


  // Load articles from API
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const apiFilters = {
        ...filters,
        sort_by: sortConfig.field,
        sort_order: sortConfig.direction
      };
      
      const response = await api.getArticles(apiFilters, currentPage, itemsPerPage);
      setArticles(response.data);
      setTotalArticles(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      console.error('Failed to load articles:', err);
      error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Articles Data (fallback)
  const mockArticles = [
    {
      id: 1,
      title: "New React 18 Features: Concurrent Features and Suspense",
      content: `React 18 introduces revolutionary changes in component rendering. Concurrent Features allow interrupting rendering to handle more urgent tasks, significantly improving application responsiveness.\n\nSuspense has been extended with new capabilities, enabling better management of asynchronous data loading. These changes fundamentally impact the architecture of modern React applications.`,
      author: "Michael Nowak",
      source: "React Blog",
      category: "WEB_DEV",
      priority: "P1_TRENDING",
      status: "PENDING_REVIEW",
      targetAudience: "developers",
      publishedAt: "2025-01-04T10:30:00Z",
      aiScores: {
        relevance: 92.5,
        novelty: 88.3,
        viral: 76.8,
        value: 91.2,
        final: 87.2
      },
      tags: ["React", "JavaScript", "Frontend", "Performance"],
      researchMaterials: [
        {
          title: "React 18 Official Documentation",
          url: "https://react.dev/blog/2022/03/29/react-v18",
          type: "Documentation"
        }
      ]
    },
    {
      id: 2,
      title: "Artificial Intelligence in Data Analysis: The Future of Data Science",
      content: `The application of AI in data analysis revolutionizes the way organizations make business decisions. Machine Learning and Deep Learning enable automation of analytical processes on an unprecedented scale.\n\nTools like AutoML democratize access to advanced analytical techniques, allowing even non-technical users to create effective predictive models.`,
      author: "Dr Catherine Wisniewski",
      source: "AI Research Journal",
      category: "AI_ML",
      priority: "P2_TIMELY",
      status: "NEW",
      targetAudience: "experts",
      publishedAt: "2025-01-04T08:15:00Z",
      aiScores: {
        relevance: 89.7,
        novelty: 82.1,
        viral: 71.4,
        value: 88.9,
        final: 83.0
      },
      tags: ["AI", "Machine Learning", "Data Science", "Analytics"],
      researchMaterials: []
    },
    {
      id: 3,
      title: "Mobile Application Security: Best Practices 2025",
      content: `Mobile application security is becoming increasingly critical in the era of growing cyber threats. Developers must implement multi-layered protection mechanisms from the design stage.\n\nFrom data encryption to API communication security - every aspect of the application requires special attention. New industry standards require compliance with GDPR regulations and other data protection laws.`,
      author: "Peter Kowalczyk",
      source: "Mobile Security Today",
      category: "SECURITY",
      priority: "P0_BREAKING",
      status: "ACCEPTED",
      targetAudience: "developers",
      publishedAt: "2025-01-03T16:45:00Z",
      aiScores: {
        relevance: 94.2,
        novelty: 79.6,
        viral: 85.3,
        value: 93.1,
        final: 88.1
      },
      tags: ["Security", "Mobile", "GDPR", "Encryption"],
      researchMaterials: [
        {
          title: "OWASP Mobile Security Guide",
          url: "https://owasp.org/www-project-mobile-security/",
          type: "Guide"
        }
      ]
    },
    {
      id: 4,
      title: "Cloud DevOps: CI/CD Process Automation with Kubernetes",
      content: `Kubernetes has become the de facto standard for container orchestration in cloud environments. Integration with CI/CD tools enables full automation of deployment and application scaling processes.\n\nModern DevOps pipelines use GitOps and Infrastructure as Code to ensure repeatability and reliability of deployments. Monitoring and observability become key to maintaining high system availability.`,
      author: "Thomas Zielinski",
      source: "Cloud Native Computing",
      category: "DEVOPS",
      priority: "P2_TIMELY",
      status: "RESEARCH_DONE",
      targetAudience: "architects",
      publishedAt: "2025-01-03T12:20:00Z",
      aiScores: {
        relevance: 87.4,
        novelty: 75.8,
        viral: 68.9,
        value: 86.2,
        final: 79.6
      },
      tags: ["DevOps", "Kubernetes", "CI/CD", "Cloud"],
      researchMaterials: []
    },
    {
      id: 5,
      title: "Blockchain in Finance: DeFi and the Future of Banking",
      content: `Decentralized Finance (DeFi) revolutionizes the traditional banking sector by eliminating intermediaries and automating financial processes through smart contracts.\n\nDeFi protocols offer new investment and lending opportunities, but also come with new types of risks. Regulators worldwide are working on legal frameworks for this emerging technology.`,
      author: "Magdalene Lewandowski",
      source: "FinTech Weekly",
      category: "BLOCKCHAIN",
      priority: "P3_EVERGREEN",
      status: "REJECTED",
      targetAudience: "mixed",
      publishedAt: "2025-01-02T14:30:00Z",
      aiScores: {
        relevance: 78.3,
        novelty: 84.7,
        viral: 92.1,
        value: 81.5,
        final: 84.2
      },
      tags: ["Blockchain", "DeFi", "Finance", "Smart Contracts"],
      researchMaterials: []
    },
    {
      id: 6,
      title: "Internet of Things: Smart Cities of the Future",
      content: `IoT transforms the way cities function by integrating sensors, devices, and management systems into one cohesive ecosystem. Smart cities use real-time data to optimize traffic, energy management, and improve residents' quality of life.\n\nChallenges related to privacy, security, and interoperability require a holistic approach to designing IoT systems in urban environments.`,
      author: "Jacob Wojcik",
      source: "Smart City Journal",
      category: "IOT",
      priority: "P4_FILLER",
      status: "ARCHIVED",
      targetAudience: "managers",
      publishedAt: "2025-01-01T09:00:00Z",
      aiScores: {
        relevance: 72.6,
        novelty: 69.4,
        viral: 58.7,
        value: 74.1,
        final: 68.7
      },
      tags: ["IoT", "Smart Cities", "Sensors", "Urban Planning"],
      researchMaterials: []
    }
  ];

  // Initialize data
  useEffect(() => {
    loadArticles();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Articles are already filtered and paginated by API
  const paginatedArticles = articles;

  // Event Handlers
  const handleFiltersChange = (newFilters: ArticleFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      category: undefined,
      priority: undefined,
      target_audience: undefined,
      score_min: undefined,
      score_max: undefined,
      tags: []
    });
    setCurrentPage(1);
  };

  const handleSelectionChange = (articleId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedArticles(prev => [...prev, articleId]);
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedArticles(paginatedArticles.map(article => article.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedArticles([]);
  };

  const handleQuickAction = async (articleId: number, action: 'accept' | 'reject' | 'needs_more') => {
    setIsProcessing(true);
    
    try {
      await api.updateArticleStatus(articleId, { action, notes: '' });
      
      const actionText = action === 'accept' ? 'accepted' : 'rejected';
      success(`Article has been ${actionText}`);
      
      // Reload articles to reflect changes
      await loadArticles();
    } catch (err) {
      console.error('Failed to update article:', err);
      error('An error occurred while performing the action');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedArticles.length === 0) return;

    // Show confirmation for delete action
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedArticles.length} articles? This operation is irreversible!`
      );
      if (!confirmed) return;
    }

    setIsProcessing(true);

    try {
      if (action === 'delete') {
        const response = await api.bulkDeleteArticles(selectedArticles);
        success(`${response.data.deleted_count} articles have been deleted`);

        if (response.data.not_found_count > 0) {
          warning(`${response.data.not_found_count} articles were not found or you don't have permissions`);
        }
      } else {
        await api.bulkUpdateArticles({
          articleIds: selectedArticles,
          action: action === 'accept' ? 'accept' : 'reject',
          notes: ''
        });

        const actionTexts = {
          accept: 'accepted',
          reject: 'rejected'
        };

        success(`${selectedArticles.length} articles have been ${actionTexts[action as keyof typeof actionTexts]}`);
      }

      setSelectedArticles([]);

      // Reload articles to reflect changes
      await loadArticles();
    } catch (err) {
      console.error('Failed to bulk action articles:', err);
      error('An error occurred while performing bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (articleId: number) => {
    navigate(`/article-details?id=${articleId}`);
  };

  const handleSort = (newSortConfig: {field: string, direction: 'asc' | 'desc'}) => {
    setSortConfig(newSortConfig);
  };

  const handleToggleExpand = (articleId: number) => {
    setExpandedRows(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedArticles([]); // Clear selection when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedArticles([]);
  };


  return (
    <div className="h-full flex flex-col p-6 space-y-6">
          {/* Skote-style Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="skote-page-title">Articles</h1>
              <p className="text-muted-foreground mt-2">
                Manage and review articles from RSS feeds
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadArticles();
                  success('All articles have been refreshed');
                }}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white skote-body-text font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Skote-style Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skote-body-text font-medium text-gray-500 uppercase tracking-wide">Total Articles</p>
                  <p className="skote-page-title font-bold text-gray-900 mt-2">{totalArticles}</p>
                  <p className="skote-body-text text-gray-500 mt-1">+2.1% from last month</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skote-body-text font-medium text-gray-500 uppercase tracking-wide">Accepted</p>
                  <p className="skote-page-title font-bold text-gray-900 mt-2">{articles.filter(a => a.status === 'ACCEPTED').length}</p>
                  <p className="skote-body-text text-green-600 mt-1">+5.4% from last week</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skote-body-text font-medium text-gray-500 uppercase tracking-wide">Pending Review</p>
                  <p className="skote-page-title font-bold text-gray-900 mt-2">{articles.filter(a => a.status === 'PENDING_REVIEW').length}</p>
                  <p className="skote-body-text text-yellow-600 mt-1">Needs attention</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skote-body-text font-medium text-gray-500 uppercase tracking-wide">Avg AI Score</p>
                  <p className="skote-page-title font-bold text-gray-900 mt-2">{Math.round(articles.reduce((acc, a) => acc + (a.aiScores?.final || 0), 0) / articles.length) || 0}</p>
                  <p className="skote-body-text text-purple-600 mt-1">Quality metric</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skote-style Filters Panel */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="skote-card-title">Article Management</h2>
                  {selectedArticles.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full skote-small-text font-medium bg-blue-100 text-blue-800">
                      {selectedArticles.length} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm skote-body-text leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {viewMode === 'cards' ? <BarChart3 size={16} className="mr-1" /> : <FileText size={16} className="mr-1" />}
                    {viewMode === 'cards' ? 'Table' : 'Cards'}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <FilterToolbar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                totalArticles={totalArticles}
                filteredCount={totalArticles}
                selectedArticles={selectedArticles}
                onBulkAction={handleBulkAction}
              />

              {selectedArticles.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <BulkActions
                    selectedCount={selectedArticles.length}
                    onBulkAction={handleBulkAction}
                    onClearSelection={handleClearSelection}
                    isProcessing={isProcessing}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Skote-style Articles Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="skote-card-title">Articles List</h2>
                  <p className="skote-body-text text-gray-500 mt-1">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalArticles)} of {totalArticles} results
                  </p>
                </div>
                {isLoading && (
                  <div className="flex items-center text-gray-500">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    <span className="skote-body-text">Loading...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <ArticleTable
                articles={paginatedArticles}
                selectedArticles={selectedArticles}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
                onQuickAction={handleQuickAction}
                onViewDetails={handleViewDetails}
                sortConfig={sortConfig}
                onSort={handleSort}
                expandedRows={expandedRows}
                onToggleExpand={handleToggleExpand}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Skote-style Pagination */}
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalArticles}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>

          {/* Toast Notifications */}
          <ToastContainer />
        </div>
  );
};

export default ArticleList;