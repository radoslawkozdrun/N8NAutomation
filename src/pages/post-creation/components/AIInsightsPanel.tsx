import React from 'react';
import Icon from '../../../components/AppIcon';

const AIInsightsPanel = ({ 
  insights, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 m-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">
            Analizowanie treści...
          </span>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 m-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Zap" size={16} className="text-primary" />
        <h3 className="font-medium text-foreground">
          Spostrzeżenia AI
        </h3>
      </div>
      
      <div className="space-y-3 text-sm">
        {/* Key Insights */}
        {insights?.keyInsights && (
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Kluczowe punkty
            </h4>
            <ul className="space-y-1">
              {insights?.keyInsights?.slice(0, 3)?.map((insight, index) => (
                <li key={index} className="text-muted-foreground flex items-start space-x-1">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Themes */}
        {insights?.themes && (
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Tematy
            </h4>
            <div className="flex flex-wrap gap-1">
              {insights?.themes?.slice(0, 4)?.map((theme, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded text-xs"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;