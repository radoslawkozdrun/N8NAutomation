import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const AIInsightsPanel = ({
  insights,
  isLoading,
  selectedArticle,
  selectedPlatforms,
  onGenerateInsights,
  onApplySuggestion,
  onRefreshInsights
}) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: 'Twitter',
      linkedin: 'Linkedin',
      instagram: 'Instagram',
      blog: 'FileText'
    };
    return icons[platform] || 'Globe';
  };

  const formatConfidence = (confidence) => {
    if (confidence >= 0.9) return 'Bardzo wysokie';
    if (confidence >= 0.7) return 'Wysokie';
    if (confidence >= 0.5) return 'Średnie';
    return 'Niskie';
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Icon name="Brain" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                AI Insights
              </h3>
              <p className="text-sm text-muted-foreground">
                Inteligentne sugestie dla twoich postów
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              onClick={() => onRefreshInsights?.()}
              loading={isLoading}
            >
              Odśwież
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Sparkles"
              onClick={() => onGenerateInsights?.()}
              disabled={!selectedArticle}
            >
              Generuj
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* No article selected */}
        {!selectedArticle && (
          <div className="text-center py-8">
            <Icon name="FileSearch" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              Wybierz artykuł
            </h4>
            <p className="text-muted-foreground">
              Wybierz artykuł źródłowy, aby otrzymać personalizowane sugestie AI
            </p>
          </div>
        )}

        {/* Article Analysis */}
        {selectedArticle && insights?.articleAnalysis && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Analiza artykułu
            </h4>
            
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <Icon name="BarChart3" size={16} className="text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Potencjał viralności</span>
                      <span className={cn("text-sm font-medium", getScoreColor(insights.articleAnalysis.viralPotential))}>
                        {insights.articleAnalysis.viralPotential}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all", getScoreBarColor(insights.articleAnalysis.viralPotential))}
                        style={{ width: `${insights.articleAnalysis.viralPotential}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sentiment:</span>
                      <span className="ml-1 font-medium text-foreground">
                        {insights.articleAnalysis.sentiment}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kategoria:</span>
                      <span className="ml-1 font-medium text-foreground">
                        {insights.articleAnalysis.category}
                      </span>
                    </div>
                  </div>

                  {/* Key Topics */}
                  <div>
                    <span className="text-sm text-muted-foreground">Kluczowe tematy:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {insights.articleAnalysis.keyTopics?.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Specific Suggestions */}
        {selectedPlatforms && insights?.platformSuggestions && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Sugestie dla platform
            </h4>
            
            <div className="space-y-3">
              {selectedPlatforms.map((platform) => {
                const suggestion = insights.platformSuggestions[platform];
                if (!suggestion) return null;

                return (
                  <div key={platform} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon name={getPlatformIcon(platform)} size={16} className="text-primary" />
                        <span className="font-medium text-foreground capitalize">{platform}</span>
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          getScoreColor(suggestion.score),
                          "bg-opacity-10"
                        )}>
                          {suggestion.score}%
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Wand2"
                        onClick={() => onApplySuggestion?.(platform, suggestion)}
                      >
                        Zastosuj
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Suggested Content */}
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Sugerowana treść
                        </span>
                        <div className="mt-1 p-3 bg-muted/20 rounded text-sm text-foreground">
                          {suggestion.suggestedContent}
                        </div>
                      </div>

                      {/* Hashtags */}
                      {suggestion.hashtags && (
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            Hashtagi
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestion.hashtags.map((hashtag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => onApplySuggestion?.(platform, { hashtags: [hashtag] })}
                              >
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best Posting Time */}
                      {suggestion.bestPostingTime && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={12} />
                            <span>Najlepszy czas: {suggestion.bestPostingTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="TrendingUp" size={12} />
                            <span>Zasięg: {suggestion.expectedReach}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Optimization Tips */}
        {insights?.optimizationTips && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Wskazówki optymalizacyjne
            </h4>
            
            <div className="space-y-3">
              {insights.optimizationTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                    tip.type === 'warning' ? 'bg-warning text-warning-foreground' :
                    tip.type === 'error' ? 'bg-error text-error-foreground' :
                    'bg-success text-success-foreground'
                  )}>
                    <Icon 
                      name={tip.type === 'warning' ? 'AlertTriangle' : 
                            tip.type === 'error' ? 'AlertCircle' : 'CheckCircle'} 
                      size={12} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{tip.message}</p>
                    {tip.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">{tip.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Prediction */}
        {insights?.performancePrediction && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Przewidywane wyniki
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {insights.performancePrediction.expectedEngagement}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Zaangażowanie
                </div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {insights.performancePrediction.expectedReach}
                </div>
                <div className="text-xs text-muted-foreground">
                  Zasięg
                </div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-warning">
                  {formatConfidence(insights.performancePrediction.confidence)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Pewność
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No insights available */}
        {selectedArticle && !insights && (
          <div className="text-center py-8">
            <Icon name="Brain" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              Brak insights
            </h4>
            <p className="text-muted-foreground mb-4">
              Kliknij "Generuj", aby otrzymać personalizowane sugestie AI
            </p>
            <Button
              variant="default"
              iconName="Sparkles"
              onClick={() => onGenerateInsights?.()}
            >
              Generuj insights
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;