import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { api } from '../../lib/api';
import { MasterContent, MasterContentFilters, MasterContentStatus, ArticleCategory, TargetAudience, ContentTone } from '../../types';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  FileText,
  Tag,
  User,
  Calendar,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const MasterContentPage = () => {
  const { user } = useAuth();
  const { setCurrentView } = useNavigation();
  const { toasts, success, error, removeToast } = useToast();
  
  const [masterContents, setMasterContents] = useState<MasterContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [filters, setFilters] = useState<MasterContentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data for demonstration
  const getMockMasterContents = () => {
    return [
      {
        id: 1,
        article_id: 101,
        title: "The Future of Artificial Intelligence in Business - Complete 2025 Guide",
        content: "In 2025, artificial intelligence becomes an essential element of business strategy. Companies use AI to automate processes, analyze data and personalize customer experiences. This article presents the most important trends, challenges and opportunities that AI implementation brings to various economic sectors.",
        summary: "Comprehensive overview of AI's role in business for 2025, with practical implementation guidelines.",
        key_points: [
          "AI automates business processes increasing efficiency by 40%",
          "AI personalization improves customer experiences and increases conversions",
          "Ethical and regulatory challenges require a responsible approach",
          "ROI from AI investments reaches an average of 300% within 2 years"
        ],
        tags: ["ai", "business", "automation", "strategy", "2025"],
        category: "AI_ML" as ArticleCategory,
        target_audience: "managers" as TargetAudience,
        tone: "professional" as ContentTone,
        status: "READY_FOR_REVIEW" as MasterContentStatus,
        created_at: "2025-01-15T10:30:00Z",
        updated_at: "2025-01-15T14:20:00Z",
        created_by: 1,
        updated_by: 1
      },
      {
        id: 2,
        article_id: 102,
        title: "React 19: New Features and Changes for Developers",
        content: "React 19 introduces revolutionary changes to the framework ecosystem. New Server Components, improved Hooks and performance optimizations change the way web applications are created. The article discusses all the new features in detail and shows practical implementation examples.",
        summary: "Overview of the most important new features in React 19 with practical code examples.",
        key_points: [
          "Server Components revolutionize server-side rendering",
          "New Hooks simplify application state management",
          "Performance optimizations reduce loading time by 30%",
          "Backward compatibility maintained for React 18"
        ],
        tags: ["react", "javascript", "web-development", "frontend"],
        category: "WEB_DEV" as ArticleCategory,
        target_audience: "developers" as TargetAudience,
        tone: "educational" as ContentTone,
        status: "APPROVED" as MasterContentStatus,
        created_at: "2025-01-14T09:15:00Z",
        updated_at: "2025-01-14T16:45:00Z",
        created_by: 2,
        updated_by: 2
      },
      {
        id: 3,
        article_id: 103,
        title: "Cybersecurity in the IoT Era - Protection Against Threats",
        content: "Internet of Things (IoT) creates new opportunities, but also new cybersecurity threats. The article discusses the main attack vectors on IoT devices, protection methods and best practices for implementing security in IoT environments.",
        summary: "Guide to securing IoT devices against modern threats.",
        key_points: [
          "IoT devices often have weak default security",
          "Network segmentation key to limiting attack spread",
          "Regular firmware updates reduce risk by 70%",
          "Zero Trust Architecture optimal for IoT environments"
        ],
        tags: ["cybersecurity", "iot", "security", "network"],
        category: "SECURITY" as ArticleCategory,
        target_audience: "architects" as TargetAudience,
        tone: "authoritative" as ContentTone,
        status: "DRAFT" as MasterContentStatus,
        created_at: "2025-01-13T11:20:00Z",
        updated_at: "2025-01-13T15:30:00Z",
        created_by: 3,
        updated_by: 3
      }
    ];
  };

  // Load master contents
  const loadMasterContents = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const searchFilters = {
          ...filters,
          search: searchTerm || undefined,
        };
        
        const response = await api.getMasterContents(searchFilters, currentPage, 20);
        setMasterContents(response.data);
        setTotalPages(response.pagination.total_pages);
      } catch (apiError) {
        // Fall back to mock data if API fails
        console.log('API not available, using mock data');
        const mockData = getMockMasterContents();
        
        // Apply filters to mock data
        let filteredData = mockData;
        
        if (searchTerm) {
          filteredData = filteredData.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (filters.status) {
          filteredData = filteredData.filter(item => item.status === filters.status);
        }
        
        if (filters.category) {
          filteredData = filteredData.filter(item => item.category === filters.category);
        }
        
        if (filters.tone) {
          filteredData = filteredData.filter(item => item.tone === filters.tone);
        }
        
        setMasterContents(filteredData);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load master contents:', err);
      error('Failed to load master contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterContents();
  }, [currentPage, filters, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadMasterContents();
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<MasterContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Handle item selection
  const handleItemSelect = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === masterContents.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(masterContents.map(item => item.id));
    }
  };

  // Handle approve/reject actions
  const handleApprove = async (id: number) => {
    try {
      await api.approveMasterContent(id);
      success('Master content approved');
      loadMasterContents();
    } catch (err) {
      error('Failed to approve master content');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      await api.rejectMasterContent(id, reason || undefined);
      success('Master content rejected');
      loadMasterContents();
    } catch (err) {
      error('Failed to reject master content');
    }
  };

  // Navigate to edit page
  const handleEdit = (id: number) => {
    window.location.hash = `master-content-edit?id=${id}`;
    setCurrentView('master-content-edit');
  };

  // Navigate to platforms view with master content
  const handleCreatePlatformContent = (id: number) => {
    window.location.hash = `social-platforms?master_content_id=${id}`;
    setCurrentView('social-platforms');
  };

  // Status color mapping
  const getStatusColor = (status: MasterContentStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'READY_FOR_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Tone color mapping
  const getToneColor = (tone: ContentTone) => {
    switch (tone) {
      case 'professional': return 'bg-blue-50 text-blue-700';
      case 'casual': return 'bg-green-50 text-green-700';
      case 'friendly': return 'bg-pink-50 text-pink-700';
      case 'authoritative': return 'bg-purple-50 text-purple-700';
      case 'educational': return 'bg-orange-50 text-orange-700';
      case 'conversational': return 'bg-teal-50 text-teal-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading && masterContents.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading master content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="skote-page-title">Master Content</h1>
              <p className="text-muted-foreground mt-2">
                Manage and review content ready for social media adaptation
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Filter size={16} />
                <span>Filters</span>
              </Button>
              <Button
                onClick={loadMasterContents}
                variant="outline"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search master content..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange({ 
                      status: e.target.value as MasterContentStatus || undefined 
                    })}
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="READY_FOR_REVIEW">Ready for Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PROCESSING">Processing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange({ 
                      category: e.target.value as ArticleCategory || undefined 
                    })}
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="">All Categories</option>
                    <option value="AI_ML">AI/ML</option>
                    <option value="WEB_DEV">Web Development</option>
                    <option value="MOBILE_DEV">Mobile Development</option>
                    <option value="DATA_SCIENCE">Data Science</option>
                    <option value="DEVOPS">DevOps</option>
                    <option value="SECURITY">Security</option>
                    <option value="CLOUD">Cloud</option>
                    <option value="BLOCKCHAIN">Blockchain</option>
                    <option value="IOT">IoT</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tone</label>
                  <select
                    value={filters.tone || ''}
                    onChange={(e) => handleFilterChange({ 
                      tone: e.target.value as ContentTone || undefined 
                    })}
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="">All Tones</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="educational">Educational</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setFilters({});
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {masterContents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No master content found</h3>
            <p className="text-muted-foreground mb-4">
              Master content will appear here after articles are processed
            </p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid gap-6">
              {masterContents.map((content) => (
                <div key={content.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(content.id)}
                        onChange={() => handleItemSelect(content.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {content.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {content.summary}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <Tag size={12} />
                            <span>{content.category.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span>{content.target_audience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{new Date(content.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Tags and Tone */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(content.status)}`}>
                            {content.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getToneColor(content.tone)}`}>
                            {content.tone}
                          </span>
                          {content.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {content.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{content.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Key Points Preview */}
                        {content.key_points && content.key_points.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-foreground mb-1">Key Points:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {content.key_points.slice(0, 2).map((point, index) => (
                                <li key={index} className="flex items-start space-x-1">
                                  <span>•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                              {content.key_points.length > 2 && (
                                <li className="text-muted-foreground">
                                  +{content.key_points.length - 2} more points
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {content.status === 'READY_FOR_REVIEW' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(content.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(content.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(content.id)}
                      >
                        <Edit3 size={14} />
                      </Button>
                      {content.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          onClick={() => handleCreatePlatformContent(content.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                        >
                          <span>To Platforms</span>
                          <ChevronRight size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MasterContentPage;