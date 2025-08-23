import React from 'react';
import { cn, getScoreColor, getScoreBackgroundColor } from '@/lib/utils';

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreIndicator({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  className,
}: ScoreIndicatorProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  
  const sizes = {
    sm: {
      container: 'w-8 h-8',
      text: 'text-xs',
      stroke: '2',
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-sm',
      stroke: '3',
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-base',
      stroke: '4',
    },
  };

  const sizeConfig = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn('relative', sizeConfig.container)}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-500 ease-out',
              getScoreColor(score)
            )}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-bold',
            sizeConfig.text,
            getScoreColor(score)
          )}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Score
          </span>
          <span className={cn(
            'text-sm font-medium',
            getScoreColor(score)
          )}>
            {Math.round(score)}/{maxScore}
          </span>
        </div>
      )}
    </div>
  );
}

interface ScoreBarProps {
  scores: {
    relevance: number;
    novelty: number;
    viral: number;
    value: number;
  };
  className?: string;
}

export function ScoreBreakdown({ scores, className }: ScoreBarProps) {
  const scoreItems = [
    { label: 'Relevance', value: scores.relevance, color: 'bg-blue-500' },
    { label: 'Novelty', value: scores.novelty, color: 'bg-purple-500' },
    { label: 'Viral', value: scores.viral, color: 'bg-pink-500' },
    { label: 'Value', value: scores.value, color: 'bg-green-500' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {scoreItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-3">
          <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className={cn('h-2 rounded-full transition-all duration-300', item.color)}
              style={{ width: `${Math.min(item.value, 100)}%` }}
            />
          </div>
          <div className="w-8 text-xs text-right text-gray-600 dark:text-gray-300">
            {Math.round(item.value)}
          </div>
        </div>
      ))}
    </div>
  );
}