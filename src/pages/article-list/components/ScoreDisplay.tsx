import React from 'react';

const ScoreDisplay = ({ scores, compact = false }) => {
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

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Final:</span>
          <span className={`text-sm font-semibold ${getScoreColor(scores?.final)}`}>
            {scores?.final?.toFixed(1)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground">R</div>
            <div className={getScoreColor(scores?.relevance)}>
              {scores?.relevance?.toFixed(0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">N</div>
            <div className={getScoreColor(scores?.novelty)}>
              {scores?.novelty?.toFixed(0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">V</div>
            <div className={getScoreColor(scores?.viral)}>
              {scores?.viral?.toFixed(0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Val</div>
            <div className={getScoreColor(scores?.value)}>
              {scores?.value?.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Final Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Final Score</span>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackground(scores?.final)} ${getScoreColor(scores?.final)}`}>
          {scores?.final?.toFixed(1)}
        </div>
      </div>
      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Relevance</span>
          <span className={`text-sm font-medium ${getScoreColor(scores?.relevance)}`}>
            {scores?.relevance?.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Novelty</span>
          <span className={`text-sm font-medium ${getScoreColor(scores?.novelty)}`}>
            {scores?.novelty?.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Viral</span>
          <span className={`text-sm font-medium ${getScoreColor(scores?.viral)}`}>
            {scores?.viral?.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Value</span>
          <span className={`text-sm font-medium ${getScoreColor(scores?.value)}`}>
            {scores?.value?.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;