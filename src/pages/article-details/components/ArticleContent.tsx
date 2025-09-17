import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ArticleContent = ({ article }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatContent = (content) => {
    // Split content into paragraphs and format
    return content?.split('\n\n')?.map((paragraph, index) => (
      <p key={index} className="mb-4 text-foreground leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const shouldTruncate = article?.content?.length > 1000;
  const displayContent = shouldTruncate && !isExpanded 
    ? article?.content?.substring(0, 1000) + '...'
    : article?.content;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Article Image */}
      {article?.imageUrl && (
        <div className="w-full h-64 lg:h-80 overflow-hidden">
          <img
            src={article?.imageUrl}
            alt={article?.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/images/no_image.png';
            }}
          />
        </div>
      )}
      <div className="p-6">
        {/* Article Summary */}
        {article?.summary && (
          <div className="mb-6 p-4 bg-muted rounded-lg border-l-4 border-primary">
            <div className="flex items-start space-x-2">
              <Icon name="FileText" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {article?.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Article Content</h2>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" iconName="Copy" iconPosition="left">
                Copy
              </Button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            {formatContent(displayContent)}
          </div>

          {/* Expand/Collapse Button */}
          {shouldTruncate && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                iconPosition="right"
              >
                {isExpanded ? 'Collapse Article' : 'Expand Full Article'}
              </Button>
            </div>
          )}
        </div>

        {/* Article Metadata */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="Link" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">URL:</span>
            <a
              href={article?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              {article?.url}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;