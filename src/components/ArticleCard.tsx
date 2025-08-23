import React from 'react';
import { 
  ExternalLink, 
  User, 
  Calendar, 
  Eye, 
  Check, 
  X, 
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Article } from '@/types';
import { 
  formatDate, 
  formatRelativeDate,
  getCategoryBadgeColor,
  getCategoryLabel,
  getPriorityBadgeColor,
  getPriorityLabel,
  getAudienceBadgeColor,
  getAudienceLabel,
  truncateText,
  extractDomain,
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreIndicator } from '@/components/ui/ScoreIndicator';

interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetails: (id: number) => void;
  isProcessing: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  isSelected,
  onSelect,
  onAccept,
  onReject,
  onViewDetails,
  isProcessing,
  className,
}: ArticleCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select when clicking on buttons or links
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    onSelect(article.id);
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700
        ${isSelected 
          ? 'border-blue-500 dark:border-blue-400 shadow-md' 
          : 'border-gray-200 dark:border-gray-700'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        ${className || ''}
      `}
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Header with checkbox and score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(article.id)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                {article.title}
              </h3>
              
              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatRelativeDate(article.created_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>{extractDomain(article.link)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <ScoreIndicator 
            score={article.final_score} 
            size="md" 
            showLabel={false}
          />
        </div>

        {/* Content preview */}
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {truncateText(article.summary, 200)}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={getCategoryBadgeColor(article.category)}>
            {getCategoryLabel(article.category)}
          </Badge>
          
          <Badge className={getPriorityBadgeColor(article.priority)}>
            {getPriorityLabel(article.priority)}
          </Badge>
          
          <Badge className={getAudienceBadgeColor(article.target_audience)}>
            {getAudienceLabel(article.target_audience)}
          </Badge>

          {/* Top tags */}
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
          
          {article.tags.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{article.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Key takeaways preview */}
        {article.key_takeaways.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Key Takeaways:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {article.key_takeaways.slice(0, 2).map((takeaway, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{truncateText(takeaway, 100)}</span>
                </li>
              ))}
              {article.key_takeaways.length > 2 && (
                <li className="text-xs text-gray-500 dark:text-gray-500 ml-3">
                  +{article.key_takeaways.length - 2} more takeaways
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAccept(article.id);
              }}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject(article.id);
              }}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(article.id);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5 animate-spin" />
            <span className="font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ArticleTableRowProps {
  article: Article;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetails: (id: number) => void;
  isProcessing: boolean;
}

export function ArticleTableRow({
  article,
  isSelected,
  onSelect,
  onAccept,
  onReject,
  onViewDetails,
  isProcessing,
}: ArticleTableRowProps) {
  return (
    <tr 
      className={`
        border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isProcessing ? 'opacity-50' : ''}
      `}
    >
      {/* Checkbox */}
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(article.id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          disabled={isProcessing}
        />
      </td>

      {/* Score */}
      <td className="p-4">
        <ScoreIndicator 
          score={article.final_score} 
          size="sm" 
          showLabel={false}
        />
      </td>

      {/* Title and metadata */}
      <td className="p-4">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{article.author}</span>
            <span>•</span>
            <span>{formatRelativeDate(article.created_date)}</span>
            <span>•</span>
            <span>{extractDomain(article.link)}</span>
          </div>
        </div>
      </td>

      {/* Category & Priority */}
      <td className="p-4">
        <div className="space-y-1">
          <Badge size="sm" className={getCategoryBadgeColor(article.category)}>
            {getCategoryLabel(article.category)}
          </Badge>
          <Badge size="sm" className={getPriorityBadgeColor(article.priority)}>
            {getPriorityLabel(article.priority)}
          </Badge>
        </div>
      </td>

      {/* Summary */}
      <td className="p-4 max-w-xs">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {truncateText(article.summary, 100)}
        </p>
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept(article.id)}
            disabled={isProcessing}
          >
            <Check className="w-3 h-3" />
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(article.id)}
            disabled={isProcessing}
          >
            <X className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(article.id)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </td>
    </tr>
  );
}