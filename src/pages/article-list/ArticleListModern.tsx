import React, { useState, useEffect } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';
import { api } from '../../lib/api';
import { Article, ArticleFilters } from '../../types';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
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

const ArticleListModern = () => {
  const navigate = useMockNavigate();
  const { success, error } = useToast();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - same as original but with better structure
  const mockArticles = [
    {
      id: 1,
      title: "New React 18 Features: Concurrent Features and Suspense",
      content: "React 18 introduces revolutionary changes in component rendering...",
      author: "Michael Nowak",
      source: "React Blog",
      category: "WEB_DEV",
      priority: "P1_TRENDING",
      status: "PENDING_REVIEW",
      target_audience: "developers",
      created_date: "2025-01-04T10:30:00Z",
      relevance_score: 92.5,
      novelty_score: 88.3,
      viral_score: 76.8,
      value_score: 91.2,
      final_score: 87.2,
      tags: ["React", "JavaScript", "Frontend", "Performance"],
      summary: "Comprehensive guide to React 18's new concurrent features and improved Suspense capabilities."
    },
    {
      id: 2,
      title: "Artificial Intelligence in Data Analysis: The Future of Data Science",
      content: "The use of AI in data analysis revolutionizes how organizations make business decisions...",
      author: "Dr Catherine Wisniewska",
      source: "AI Research Journal",
      category: "AI_ML",
      priority: "P2_TIMELY",
      status: "NEW",
      target_audience: "experts",
      created_date: "2025-01-04T08:15:00Z",
      relevance_score: 89.7,
      novelty_score: 82.1,
      viral_score: 71.4,
      value_score: 88.9,
      final_score: 83.0,
      tags: ["AI", "Machine Learning", "Data Science", "Analytics"],
      summary: "Exploration of AI's transformative impact on data analysis and business decision-making."
    },
    {
      id: 3,
      title: "Mobile Application Security: Best Practices 2025",
      content: "Mobile application security is becoming increasingly critical in the era of growing threats...",
      author: "Piotr Kowalczyk",
      source: "Mobile Security Today",
      category: "SECURITY",
      priority: "P0_BREAKING",
      status: "ACCEPTED",
      target_audience: "developers",
      created_date: "2025-01-03T16:45:00Z",
      relevance_score: 94.2,
      novelty_score: 79.6,
      viral_score: 85.3,
      value_score: 93.1,
      final_score: 88.1,
      tags: ["Security", "Mobile", "GDPR", "Encryption"],
      summary: "Essential mobile app security practices and compliance requirements for 2025."
    }
  ];

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      // Try API first, fallback to mock data
      try {
        const response = await api.getArticles(filters, currentPage, 12);
        setArticles(response.data);
        setTotalPages(response.pagination.total_pages);
      } catch (apiError) {
        console.log('Using mock data');
        setArticles(mockArticles);
        setTotalPages(1);
      }
    } catch (err) {
      error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [currentPage, filters]);

  // Status color helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING_REVIEW': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0_BREAKING': return 'bg-red-500';
      case 'P1_TRENDING': return 'bg-orange-500';
      case 'P2_TIMELY': return 'bg-blue-500';
      case 'P3_EVERGREEN': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI_ML': return <Zap className="w-4 h-4" />;
      case 'WEB_DEV': return <Globe className="w-4 h-4" />;
      case 'SECURITY': return <AlertCircle className="w-4 h-4" />;
      case 'DEVOPS': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleArticleClick = (articleId: number) => {
    navigate(`/article-details?id=${articleId}`);
  };

  const ScoreCircle = ({ score, label, color = "blue" }: { score: number; label: string; color?: string }) => (
    <div className="flex flex-col items-center">
      <div className={`relative w-16 h-16 rounded-full border-4 border-${color}-200 bg-${color}-50 flex items-center justify-center`}>
        <span className={`text-lg font-bold text-${color}-700`}>{Math.round(score)}</span>
        <div 
          className={`absolute inset-0 rounded-full border-4 border-transparent border-t-${color}-500`}
          style={{ 
            transform: `rotate(${(score / 100) * 360 - 90}deg)`,
            borderRightColor: score > 25 ? `var(--${color}-500)` : 'transparent',
            borderBottomColor: score > 50 ? `var(--${color}-500)` : 'transparent',
            borderLeftColor: score > 75 ? `var(--${color}-500)` : 'transparent'
          }}
        />
      </div>
      <span className="text-xs text-gray-600 mt-1 text-center">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="skote-page-title">Article Review</h1>
                <p className="text-muted-foreground mt-2">Manage and review RSS articles</p>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">{articles.length} Articles</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadArticles}
                disabled={loading}
                className="flex items-center space-x-2 border-gray-300"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                <Plus size={16} />
                <span>Add Article</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles, authors, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 border-gray-300 px-4 py-3"
            >
              <Filter size={16} />
              <span>Filters</span>
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <option>All Statuses</option>
                    <option>New</option>
                    <option>Pending Review</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <option>All Categories</option>
                    <option>AI/ML</option>
                    <option>Web Development</option>
                    <option>Security</option>
                    <option>DevOps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <option>All Priorities</option>
                    <option>Breaking</option>
                    <option>Trending</option>
                    <option>Timely</option>
                    <option>Evergreen</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full border-gray-300">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(article.priority)}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}>
                        {article.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {article.summary || article.content.substring(0, 150) + '...'}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(article.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(article.category)}
                      <span>{article.category.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                        #{tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Section */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{Math.round(article.final_score)}</div>
                        <div className="text-xs text-gray-500">Final Score</div>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="flex space-x-3 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{Math.round(article.relevance_score)}</div>
                          <div className="text-gray-500">REL</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{Math.round(article.viral_score)}</div>
                          <div className="text-gray-500">VIR</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{Math.round(article.value_score)}</div>
                          <div className="text-gray-500">VAL</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleArticleClick(article.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Author & Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(article.priority)}`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
                              onClick={() => handleArticleClick(article.id)}
                            >
                              {article.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {article.summary || article.content.substring(0, 100) + '...'}
                            </p>
                            <div className="flex items-center space-x-1 mt-2">
                              {article.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{article.author}</div>
                          <div className="text-gray-600">{article.source}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}>
                          {article.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-gray-900">{Math.round(article.final_score)}</div>
                          <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">{Math.round(article.relevance_score)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">{Math.round(article.viral_score)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(article.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleArticleClick(article.id)}
                            className="border-gray-300"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-300">
                            <MoreVertical size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, articles.length)} of {articles.length} results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="border-gray-300"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "bg-blue-600 text-white" : "border-gray-300"}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="border-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleListModern;