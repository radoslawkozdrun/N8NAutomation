import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ScoringPanel = ({ scores, insights }) => {
  const [showTooltip, setShowTooltip] = useState(null);

  // Clean special characters from insights
  const cleanInsight = (insight) => {
    if (typeof insight !== 'string') return insight;
    return insight.replace(/[.{}"']/g, '').trim();
  };

  const scoreItems = [
    {
      key: 'relevance',
      label: 'Relevance',
      value: scores?.relevance,
      description: 'How well the article fits our target audience',
      color: 'text-blue-600'
    },
    {
      key: 'novelty',
      label: 'Novelty',
      value: scores?.novelty,
      description: 'Whether the article contains new, unique information',
      color: 'text-green-600'
    },
    {
      key: 'viral',
      label: 'Viral Potential',
      value: scores?.viral,
      description: 'Probability that the article will be widely shared',
      color: 'text-purple-600'
    },
    {
      key: 'value',
      label: 'Value',
      value: scores?.value,
      description: 'Practical value of the article for readers',
      color: 'text-orange-600'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getFinalScoreColor = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">AI Analysis</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Brain" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Automatic Assessment</span>
        </div>
      </div>
      {/* Individual Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scoreItems?.map((item) => (
          <div
            key={item?.key}
            className="relative"
            onMouseEnter={() => setShowTooltip(item?.key)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div className={`p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-smooth ${getScoreBackground(item?.value)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item?.label}</span>
                <Icon name="Info" size={14} className="text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(item?.value)}`}>
                {item?.value}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-smooth ${item?.color?.replace('text-', 'bg-')}`}
                  style={{ width: `${item?.value}%` }}
                />
              </div>
            </div>

            {/* Tooltip */}
            {showTooltip === item?.key && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                <div className="bg-popover border border-border rounded-lg p-3 shadow-modal max-w-xs">
                  <p className="text-sm text-popover-foreground">{item?.description}</p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Final Score */}
      <div className="bg-muted rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Final Score</h3>
            <p className="text-sm text-muted-foreground">
              Weighted average of all criteria
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-2xl font-bold ${getFinalScoreColor(scores?.final)}`}>
              {scores?.final}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {scores?.final >= 80 ? 'Excellent' :
               scores?.final >= 60 ? 'Good' :
               scores?.final >= 40 ? 'Average' : 'Poor'}
            </p>
          </div>
        </div>
      </div>
      {/* AI Insights */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-foreground">Key AI Insights</h3>
        <div className="space-y-3">
          {insights?.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <Icon name="Lightbulb" size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{cleanInsight(insight)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoringPanel;