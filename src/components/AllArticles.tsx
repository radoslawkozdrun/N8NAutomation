import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Article } from '@/types';
import Button from './ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreIndicator } from '@/components/ui/ScoreIndicator';
import { ResearchMaterialsModal } from '@/components/ResearchMaterialsModal';
import { formatRelativeDate } from '@/lib/utils';

export function AllArticles() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [selectedArticleForResearch, setSelectedArticleForResearch] = useState<Article | null>(null);

  const { 
    data: articlesResponse, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['all-articles', page, limit, selectedStatus, sortBy, sortOrder],
    queryFn: () => api.getArticles({ 
      status: selectedStatus, 
      sort_by: sortBy, 
      sort_order: sortOrder 
    }, page, limit),
    keepPreviousData: true,
  });

  const articles = articlesResponse?.data || [];
  const pagination = articlesResponse?.pagination;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'RESEARCH_DONE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'DRAFT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'SCHEDULED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'NEEDS_REVIEW':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Available status options (based on actual data in database)
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'RESEARCH_DONE', label: 'Research Done' },
  ];

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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

  const sortableFields = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'target_audience', label: 'Audience' },
    { key: 'final_score', label: 'Score' },
    { key: 'status', label: 'Status' },
    { key: 'created_date', label: 'Created' },
  ];

  const handleViewResearch = (article: Article) => {
    setSelectedArticleForResearch(article);
    setResearchModalOpen(true);
  };

  const handleCloseResearchModal = () => {
    setResearchModalOpen(false);
    setSelectedArticleForResearch(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load articles
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            All Articles Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete overview of all articles in the system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            loading={isRefetching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {pagination ? `${pagination.total} total articles` : ''}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no articles in the system yet.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                    onClick={() => handleSort('author')}
                  >
                    <div className="flex items-center justify-between">
                      Author
                      {getSortIcon('author')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-80 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center justify-between">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Summary
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                    onClick={() => handleSort('created_date')}
                  >
                    <div className="flex items-center justify-between">
                      Published
                      {getSortIcon('created_date')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                    onClick={() => handleSort('final_score')}
                  >
                    <div className="flex items-center justify-between">
                      Score
                      {getSortIcon('final_score')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                    Link
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                    Research
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {articles.map((article: Article) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap w-32">
                      <div style={{width: '8rem'}}>
                        <Badge className={`${getStatusBadgeColor(article.status)} w-full justify-center text-center px-2 py-1`}>
                          {formatStatus(article.status)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-32">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {truncateText(article.author || 'Unknown', 20)}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-80">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-none whitespace-normal">
                        {article.summary || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-28">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatRelativeDate(article.created_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-20">
                      <ScoreIndicator score={article.final_score} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-16 text-center">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Open original article"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-20 text-center">
                      {article.status === 'RESEARCH_DONE' && (
                        <button
                          onClick={() => handleViewResearch(article)}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                          title="View research materials"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4">
          <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{((page - 1) * limit) + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-l-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.total_pages}
                    className="rounded-r-md"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Research Materials Modal */}
      {selectedArticleForResearch && (
        <ResearchMaterialsModal
          articleId={selectedArticleForResearch.id}
          isOpen={researchModalOpen}
          onClose={handleCloseResearchModal}
          articleTitle={selectedArticleForResearch.title}
        />
      )}
    </div>
  );
}