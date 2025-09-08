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
      'NEW': 'bg-blue-100 text-blue-800',
      'PENDING_REVIEW': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800',
      'NEEDS_MORE': 'bg-orange-100 text-orange-800',
      'RESEARCH_DONE': 'bg-purple-100 text-purple-800'
    };
    return statusColors?.[status] || 'bg-gray-100 text-gray-800';
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
          Powrót do listy artykułów
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
            <span>Autor: {article?.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} />
            <span>Opublikowano: {formatDate(article?.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Globe" size={16} />
            <span>Źródło: {article?.source}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} />
            <span>Czas czytania: {article?.readingTime} min</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {article?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;