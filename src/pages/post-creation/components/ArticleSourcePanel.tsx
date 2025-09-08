import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const ArticleSourcePanel = ({ 
  article, 
  aiInsights, 
  isAnalyzing, 
  onAnalyzeContent 
}) => {
  if (!article) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Icon name="FileX" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nie wybrano artykułu źródłowego</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Artykuł źródłowy
            </h2>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground line-clamp-2">
                {article?.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Autor: {article?.author}</span>
                <span>•</span>
                <span>{article?.publishedAt?.toLocaleDateString('pl-PL')}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs">
                  {article?.status}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            loading={isAnalyzing}
            onClick={() => onAnalyzeContent?.(article?.content)}
          >
            Analizuj
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none">
          <div className="bg-muted/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-foreground mb-2">Treść artykułu</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {article?.content}
            </p>
          </div>

          {/* AI Insights */}
          {aiInsights && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={16} className="text-primary" />
                <h4 className="font-medium text-foreground">
                  Analiza AI
                </h4>
              </div>

              {/* Key Insights */}
              {aiInsights?.keyInsights && (
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h5 className="font-medium text-foreground mb-2 text-sm">
                    Kluczowe spostrzeżenia
                  </h5>
                  <ul className="space-y-1">
                    {aiInsights?.keyInsights?.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <Icon name="ArrowRight" size={12} className="mt-1 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Themes */}
              {aiInsights?.themes && (
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <h5 className="font-medium text-foreground mb-2 text-sm">
                    Główne tematy
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights?.themes?.map((theme, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotable Moments */}
              {aiInsights?.quotes && (
                <div className="bg-accent/5 p-4 rounded-lg">
                  <h5 className="font-medium text-foreground mb-2 text-sm">
                    Cytowalne momenty
                  </h5>
                  <div className="space-y-2">
                    {aiInsights?.quotes?.map((quote, index) => (
                      <blockquote 
                        key={index}
                        className="border-l-2 border-accent pl-3 text-sm text-muted-foreground italic"
                      >
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Metadata */}
              <div className="bg-muted/10 p-4 rounded-lg">
                <h5 className="font-medium text-foreground mb-2 text-sm">
                  Metadata treści
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Grupa docelowa:</span>
                    <div className="font-medium">{aiInsights?.targetAudience || 'Nie określono'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Poziom złożoności:</span>
                    <div className={cn(
                      "font-medium capitalize",
                      aiInsights?.complexity === 'advanced' && 'text-error',
                      aiInsights?.complexity === 'intermediate' && 'text-warning',
                      aiInsights?.complexity === 'beginner' && 'text-success'
                    )}>
                      {aiInsights?.complexity || 'Nie określono'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-muted/20 p-6 rounded-lg">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Analizowanie treści za pomocą AI...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleSourcePanel;