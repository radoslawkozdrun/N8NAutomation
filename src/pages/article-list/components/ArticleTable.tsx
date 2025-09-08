import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
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
  onToggleExpand
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

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 p-3 text-left">
                <Checkbox
                  checked={selectedArticles?.length === articles?.length && articles?.length > 0}
                  onChange={onSelectAll}
                  indeterminate={selectedArticles?.length > 0 && selectedArticles?.length < articles?.length}
                />
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  iconName={getSortIcon('title')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Tytuł
                </Button>
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('finalScore')}
                  iconName={getSortIcon('finalScore')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Oceny AI
                </Button>
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  iconName={getSortIcon('category')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Kategoria
                </Button>
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('priority')}
                  iconName={getSortIcon('priority')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Priorytet
                </Button>
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  iconName={getSortIcon('status')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Status
                </Button>
              </th>
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('publishedAt')}
                  iconName={getSortIcon('publishedAt')}
                  iconPosition="right"
                  className="font-medium"
                >
                  Data
                </Button>
              </th>
              <th className="w-32 p-3 text-center font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article) => (
              <React.Fragment key={article?.id}>
                <tr
                  className={`border-b border-border hover:bg-muted/50 transition-hover ${
                    selectedArticles?.includes(article?.id) ? 'bg-primary/5' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(article?.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedArticles?.includes(article?.id)}
                      onChange={(e) => onSelectionChange(article?.id, e?.target?.checked)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground leading-tight">
                        {truncateText(article?.title, 60)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {article?.author} • {article?.source}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleExpand(article?.id)}
                          iconName={expandedRows?.includes(article?.id) ? "ChevronUp" : "ChevronDown"}
                          iconPosition="left"
                          className="text-xs"
                        >
                          {expandedRows?.includes(article?.id) ? 'Zwiń' : 'Pokaż szczegóły'}
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <ScoreDisplay scores={article?.aiScores} compact />
                  </td>
                  <td className="p-3">
                    <CategoryBadge category={article?.category} />
                  </td>
                  <td className="p-3">
                    <PriorityBadge priority={article?.priority} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={article?.status} />
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(article?.publishedAt)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(article?.id)}
                        title="Zobacz szczegóły"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      {article?.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onQuickAction(article?.id, 'accept')}
                            title="Zaakceptuj"
                            className="text-success hover:text-success"
                          >
                            <Icon name="Check" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onQuickAction(article?.id, 'reject')}
                            title="Odrzuć"
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
                    <td colSpan="8" className="p-0">
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
                onChange={(e) => onSelectionChange(article?.id, e?.target?.checked)}
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
                {expandedRows?.includes(article?.id) ? 'Zwiń' : 'Szczegóły'}
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(article?.id)}
                  iconName="Eye"
                  iconPosition="left"
                >
                  Zobacz
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
            Brak artykułów
          </h3>
          <p className="text-muted-foreground">
            Nie znaleziono artykułów spełniających kryteria wyszukiwania.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleTable;