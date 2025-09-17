import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import StatusBadge from './StatusBadge';
import ScoreDisplay from './ScoreDisplay';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import ArticleInsights from './ArticleInsights';

const ArticleTable = ({ 
  articles, 
  selectedArticles, 
  onSelectionChange, 
  onSelectAll, 
  onQuickAction,
  onViewDetails,
  sortConfig,
  onSort,
  expandedRows,
  onToggleExpand,
  isLoading
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field) => {
    if (sortConfig?.field !== field) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  const getStatusStyling = (status) => {
    const configs = {
      NEW: 'bg-yellow-400 text-yellow-900 border-yellow-500',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ACCEPTED: 'bg-green-500 text-white border-green-600',
      REJECTED: 'bg-red-500 text-white border-red-600',
      ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',
      NEEDS_MORE: 'bg-orange-100 text-orange-800 border-orange-200',
      RESEARCH_DONE: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return configs?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <LoadingSpinner size="large" text="Loading articles..." className="h-64" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedArticles?.length === articles?.length && articles?.length > 0}
                  onChange={(e) => onSelectAll(e)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Article</span>
                  <Icon 
                    name={sortConfig?.field === 'title' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Category</span>
                  <Icon 
                    name={sortConfig?.field === 'category' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Priority</span>
                  <Icon 
                    name={sortConfig?.field === 'priority' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Status</span>
                  <Icon 
                    name={sortConfig?.field === 'status' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('created_date')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Created Date</span>
                  <Icon 
                    name={sortConfig?.field === 'created_date' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="w-32 px-4 py-3 text-center text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article) => (
              <React.Fragment key={article?.id}>
                <tr className="hover:bg-muted/30 transition-hover">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedArticles?.includes(article?.id)}
                      onChange={(e) => onSelectionChange(article?.id, e.target.checked)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-foreground truncate" title={article?.title}>
                        {article?.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {article?.author}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {article?.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {article?.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {article?.priority && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                        {article?.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium border w-32 ${getStatusStyling(article?.status)}`}>
                      {article?.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{formatDate(article?.created_date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(article?.id)}
                        title="View details"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      {article?.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onQuickAction(article?.id, 'accept')}
                            title="Accept"
                            className="text-success hover:text-success"
                          >
                            <Icon name="Check" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onQuickAction(article?.id, 'reject')}
                            title="Reject"
                            className="text-destructive hover:text-destructive"
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows?.includes(article?.id) && (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <div className="bg-muted/30 border-t border-border">
                        <ArticleInsights article={article} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {articles?.map((article) => (
          <div
            key={article?.id}
            className={`border border-border rounded-lg p-4 space-y-3 ${
              selectedArticles?.includes(article?.id) ? 'bg-primary/5 border-primary/20' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selectedArticles?.includes(article?.id)}
                onChange={(checked) => onSelectionChange(article?.id, checked)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium text-foreground leading-tight">
                  {article?.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {article?.author} • {article?.source}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={article?.status} />
                  <CategoryBadge category={article?.category} />
                  <PriorityBadge priority={article?.priority} />
                </div>
                <ScoreDisplay scores={article?.aiScores} compact />
                <div className="text-xs text-muted-foreground">
                  {formatDate(article?.publishedAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(article?.id)}
                iconName={expandedRows?.includes(article?.id) ? "ChevronUp" : "ChevronDown"}
                iconPosition="left"
              >
                {expandedRows?.includes(article?.id) ? 'Collapse' : 'Details'}
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(article?.id)}
                  iconName="Eye"
                  iconPosition="left"
                >
                  View
                </Button>
                {article?.status === 'PENDING_REVIEW' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onQuickAction(article?.id, 'accept')}
                      className="text-success"
                    >
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onQuickAction(article?.id, 'reject')}
                      className="text-destructive"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {expandedRows?.includes(article?.id) && (
              <div className="pt-3 border-t border-border">
                <ArticleInsights article={article} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Empty State */}
      {articles?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No articles
          </h3>
          <p className="text-muted-foreground">
            No articles found matching the search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleTable;