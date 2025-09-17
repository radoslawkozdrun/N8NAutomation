import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ArticleHeader = ({ article, onBack }) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'NEW': 'bg-yellow-400 text-yellow-900 border border-yellow-500',
      'PENDING_REVIEW': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'ACCEPTED': 'bg-green-500 text-white border border-green-600',
      'REJECTED': 'bg-red-500 text-white border border-red-600',
      'ARCHIVED': 'bg-gray-100 text-gray-800 border border-gray-200',
      'NEEDS_MORE': 'bg-orange-100 text-orange-800 border border-orange-200',
      'RESEARCH_DONE': 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    return statusColors?.[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  return (
    <div className="bg-card border-b border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <Button
          variant="ghost"
          iconName="ArrowLeft"
          iconPosition="left"
          onClick={onBack}
          className="mb-4"
        >
          Back to article list
        </Button>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article?.status)}`}>
            {article?.status?.replace('_', ' ')}
          </span>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
          {article?.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="User" size={16} />
            <span>Author: {article?.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} />
            <span>Published: {formatDate(article?.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Globe" size={16} />
            <span>Source: {article?.source}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} />
            <span>Reading time: {article?.readingTime} min</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {article?.tags?.map((tag, index) => {
            // Clean up the tag by removing quotes, curly braces, and extra whitespace
            const cleanTag = typeof tag === 'string' ? tag.replace(/['"{}]/g, '').trim() : tag;
            return (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs"
              >
                #{cleanTag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;