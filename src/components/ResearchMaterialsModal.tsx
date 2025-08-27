import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink, Calendar, User, FileText, Loader2, AlertCircle, Expand, Minimize2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ResearchMaterial } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils';

interface ResearchMaterialsModalProps {
  articleId: number;
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
}

export function ResearchMaterialsModal({ 
  articleId, 
  isOpen, 
  onClose, 
  articleTitle 
}: ResearchMaterialsModalProps) {
  const [expandedContent, setExpandedContent] = useState<Set<number>>(new Set());
  const { 
    data: response, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['research-materials', articleId],
    queryFn: () => api.getResearchMaterials(articleId),
    enabled: isOpen && !!articleId,
  });

  const materials = response?.data || [];

  if (!isOpen) return null;

  const getResearchTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'web':
      case 'webpage':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'academic':
      case 'paper':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'news':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'blog':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'social':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const toggleContentExpansion = (materialId: number) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedContent(newExpanded);
  };

  const expandAll = () => {
    const allIds = materials.filter(m => m.content && m.content.length > 300).map(m => m.id);
    setExpandedContent(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedContent(new Set());
  };

  const hasLongContent = materials.some(m => m.content && m.content.length > 300);
  const allExpanded = hasLongContent && materials.filter(m => m.content && m.content.length > 300).every(m => expandedContent.has(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Research Materials
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {articleTitle}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasLongContent && materials.length > 0 && (
              <button
                onClick={allExpanded ? collapseAll : expandAll}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {allExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <Expand className="w-4 h-4 mr-1" />
                    Expand All
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading research materials...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed to load research materials
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No research materials found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No research materials have been collected for this article yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {materials.map((material: ResearchMaterial) => (
                <div 
                  key={material.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                >
                  {/* Material Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {material.title || 'Untitled Research Material'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {material.author && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {material.author}
                          </div>
                        )}
                        {material.publication_date && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatRelativeDate(material.publication_date)}
                          </div>
                        )}
                        <Badge className={getResearchTypeBadgeColor(material.research_type)}>
                          {material.research_type}
                        </Badge>
                      </div>
                    </div>
                    {material.source_url && (
                      <a
                        href={material.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Open source URL"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {/* Material Content */}
                  {material.content && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Content:
                        </h4>
                        {material.content.length > 300 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {material.content.length.toLocaleString()} chars
                            </span>
                            <button
                              onClick={() => toggleContentExpansion(material.id)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              {expandedContent.has(material.id) ? (
                                <>
                                  <Minimize2 className="w-3 h-3 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <Expand className="w-3 h-3 mr-1" />
                                  Show Full Content
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600 relative">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {expandedContent.has(material.id) 
                            ? material.content 
                            : truncateContent(material.content)
                          }
                        </p>
                        {!expandedContent.has(material.id) && material.content.length > 300 && (
                          <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-white dark:from-gray-800 via-white dark:via-gray-800 to-transparent h-8 pointer-events-none"></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Search ID: {material.search_id}</span>
                      <span>Added: {formatRelativeDate(material.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}