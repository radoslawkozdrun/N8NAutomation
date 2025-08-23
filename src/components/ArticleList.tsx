import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  CheckSquare, 
  X, 
  MoreHorizontal,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Article, ArticleFilters as FilterType, ReviewDecision } from '@/types';
import { ArticleCard, ArticleTableRow } from '@/components/ArticleCard';
import { ArticleFilters } from '@/components/ArticleFilters';
import { Button } from '@/components/ui/Button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface ArticleListProps {
  onArticleSelect: (article: Article) => void;
}

export function ArticleList({ onArticleSelect }: ArticleListProps) {
  // State
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filters, setFilters] = useState<FilterType>({});
  const [sortBy, setSortBy] = useState<'final_score' | 'created_date' | 'priority'>('final_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [processingArticles, setProcessingArticles] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();

  // Fetch articles
  const { 
    data: articlesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['articles', filters, sortBy, sortOrder, page],
    queryFn: () => api.getArticles(filters, page, 20),
    keepPreviousData: true,
  });

  const articles = articlesResponse?.data || [];
  const pagination = articlesResponse?.pagination;

  // Mutations
  const updateArticleMutation = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: ReviewDecision }) =>
      api.updateArticleStatus(id, decision),
    onMutate: ({ id }) => {
      setProcessingArticles(prev => new Set(prev).add(id));
    },
    onSuccess: (_, { id, decision }) => {
      setProcessingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setSelectedArticles(prev => prev.filter(articleId => articleId !== id));
      queryClient.invalidateQueries(['articles']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success(`Article ${decision.action}ed successfully`);
    },
    onError: (error, { id }) => {
      setProcessingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update article: ${message}`);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: api.bulkUpdateArticles,
    onMutate: () => {
      selectedArticles.forEach(id => {
        setProcessingArticles(prev => new Set(prev).add(id));
      });
    },
    onSuccess: (_, variables) => {
      setProcessingArticles(new Set());
      setSelectedArticles([]);
      queryClient.invalidateQueries(['articles']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success(`${variables.articleIds.length} articles ${variables.action}ed successfully`);
    },
    onError: (error) => {
      setProcessingArticles(new Set());
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Bulk operation failed: ${message}`);
    },
  });

  // Handlers
  const handleArticleSelect = (id: number) => {
    setSelectedArticles(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(article => article.id));
    }
  };

  const handleAccept = (id: number) => {
    updateArticleMutation.mutate({ 
      id, 
      decision: { action: 'accept' } 
    });
  };

  const handleReject = (id: number) => {
    updateArticleMutation.mutate({ 
      id, 
      decision: { action: 'reject' } 
    });
  };

  const handleBulkAccept = () => {
    if (selectedArticles.length === 0) return;
    
    bulkUpdateMutation.mutate({
      articleIds: selectedArticles,
      action: 'accept',
    });
  };

  const handleBulkReject = () => {
    if (selectedArticles.length === 0) return;
    
    bulkUpdateMutation.mutate({
      articleIds: selectedArticles,
      action: 'reject',
    });
  };

  const handleSortChange = (
    newSortBy: 'final_score' | 'created_date' | 'priority',
    newSortOrder: 'asc' | 'desc'
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 'a',
      action: 'accept-current',
      description: 'Accept current/selected articles',
      handler: () => {
        if (selectedArticles.length > 0) {
          handleBulkAccept();
        }
      },
    },
    {
      key: 'r',
      action: 'reject-current',
      description: 'Reject current/selected articles',
      handler: () => {
        if (selectedArticles.length > 0) {
          handleBulkReject();
        }
      },
    },
    {
      key: 'shift+a',
      action: 'select-all',
      description: 'Select/deselect all visible articles',
      handler: handleSelectAll,
    },
    {
      key: 'escape',
      action: 'clear-selection',
      description: 'Clear selection',
      handler: () => setSelectedArticles([]),
    },
  ];

  useKeyboardShortcuts(keyboardShortcuts);

  // Reset selection when query parameters change (new page, filters, etc.)
  useEffect(() => {
    setSelectedArticles([]);
  }, [filters, sortBy, sortOrder, page]);

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
    <div className="flex flex-col h-full">
      {/* Filters */}
      <ArticleFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalCount={pagination?.total || 0}
        selectedCount={selectedArticles.length}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* Bulk actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAccept}
                loading={bulkUpdateMutation.isLoading}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Accept All
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                loading={bulkUpdateMutation.isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Reject All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedArticles([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MoreHorizontal className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or check back later for new articles.
            </p>
            <Button variant="outline" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isSelected={selectedArticles.includes(article.id)}
                    onSelect={handleArticleSelect}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onViewDetails={(id) => {
                      const article = articles.find(a => a.id === id);
                      if (article) onArticleSelect(article);
                    }}
                    isProcessing={processingArticles.has(article.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="w-12 p-4">
                        <input
                          type="checkbox"
                          checked={selectedArticles.length === articles.length && articles.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="w-20 p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Score
                      </th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Title
                      </th>
                      <th className="w-40 p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Category
                      </th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Summary
                      </th>
                      <th className="w-32 p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {articles.map((article) => (
                      <ArticleTableRow
                        key={article.id}
                        article={article}
                        isSelected={selectedArticles.includes(article.id)}
                        onSelect={handleArticleSelect}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onViewDetails={(id) => {
                      const article = articles.find(a => a.id === id);
                      if (article) onArticleSelect(article);
                    }}
                        isProcessing={processingArticles.has(article.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    ({pagination.total} total)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.total_pages || isLoading}
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
}