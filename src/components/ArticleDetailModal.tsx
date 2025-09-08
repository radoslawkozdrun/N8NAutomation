import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  X, 
  ExternalLink, 
  User, 
  Calendar, 
  Clock,
  Check, 
  Trash2,
  Bookmark,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { Article, ReviewDecision } from '@/types';
import { api } from '@/lib/api';
import { 
  formatDate, 
  formatRelativeDate,
  getCategoryBadgeColor,
  getCategoryLabel,
  getPriorityBadgeColor,
  getPriorityLabel,
  getAudienceBadgeColor,
  getAudienceLabel,
  extractDomain,
  cn,
} from '@/lib/utils';
import Button from './ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreIndicator, ScoreBreakdown } from '@/components/ui/ScoreIndicator';

interface ArticleDetailModalProps {
  articleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function ArticleDetailModal({
  articleId,
  isOpen,
  onClose,
  onAccept,
  onReject,
}: ArticleDetailModalProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch article details
  const { 
    data: articleResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => articleId ? api.getArticle(articleId) : null,
    enabled: !!articleId && isOpen,
  });

  const article = articleResponse?.data;

  // Mutations
  const updateArticleMutation = useMutation({
    mutationFn: ({ decision }: { decision: ReviewDecision }) =>
      articleId ? api.updateArticleStatus(articleId, decision) : Promise.reject(),
    onSuccess: (_, { decision }) => {
      queryClient.invalidateQueries(['articles']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success(`Article ${decision.action}ed successfully`);
      onClose();
      
      // Call parent handlers if provided
      if (decision.action === 'accept' && onAccept && articleId) {
        onAccept(articleId);
      } else if (decision.action === 'reject' && onReject && articleId) {
        onReject(articleId);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update article: ${message}`);
    },
  });

  const handleAccept = () => {
    updateArticleMutation.mutate({
      decision: { action: 'accept', notes: notes.trim() || undefined }
    });
  };

  const handleReject = () => {
    updateArticleMutation.mutate({
      decision: { action: 'reject', notes: notes.trim() || undefined }
    });
  };

  const handleMarkForLater = () => {
    updateArticleMutation.mutate({
      decision: { action: 'needs_more', notes: notes.trim() || undefined }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Article Details
              </h2>
              {article && (
                <ScoreIndicator 
                  score={article.final_score} 
                  size="sm" 
                  showLabel={true}
                />
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading article...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">
                  Failed to load article details
                </p>
              </div>
            ) : article ? (
              <div className="p-6 space-y-6">
                {/* Title and metadata */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                    {article.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.created_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatRelativeDate(article.created_date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{extractDomain(article.link)}</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(article.link, 'Article URL')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Categories and tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getCategoryBadgeColor(article.category)}>
                    {getCategoryLabel(article.category)}
                  </Badge>
                  
                  <Badge className={getPriorityBadgeColor(article.priority)}>
                    {getPriorityLabel(article.priority)}
                  </Badge>
                  
                  <Badge className={getAudienceBadgeColor(article.target_audience)}>
                    {getAudienceLabel(article.target_audience)}
                  </Badge>

                  {article.subcategory && (
                    <Badge variant="secondary">
                      {article.subcategory}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Tags:
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Scores breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      AI Score Breakdown
                    </h3>
                    <ScoreBreakdown
                      scores={{
                        relevance: article.relevance_score,
                        novelty: article.novelty_score,
                        viral: article.viral_score,
                        value: article.value_score,
                      }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      AI Reasoning
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {article.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    AI-Generated Summary
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Key takeaways */}
                {article.key_takeaways.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {article.key_takeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1 font-bold">•</span>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {takeaway}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Original content preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Original Content
                    </h3>
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showFullContent ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Show less</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Show full content</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {showFullContent 
                        ? article.content 
                        : article.content.slice(0, 1000) + (article.content.length > 1000 ? '...' : '')
                      }
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Review Notes (Optional)
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your decision..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No article data available
              </div>
            )}
          </div>

          {/* Footer actions */}
          {article && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  loading={updateArticleMutation.isLoading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Article
                </Button>
                
                <Button
                  variant="danger"
                  onClick={handleReject}
                  loading={updateArticleMutation.isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reject Article
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleMarkForLater}
                  loading={updateArticleMutation.isLoading}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Needs More Review
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={updateArticleMutation.isLoading}
              >
                Close
              </Button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}