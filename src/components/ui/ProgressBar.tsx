import React from 'react';
import { cn, getScoreGradient } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'score';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const getBarColor = () => {
    if (variant === 'score') {
      return `bg-gradient-to-r ${getScoreGradient(value)}`;
    }
    return 'bg-blue-600';
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden',
        heights[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            getBarColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}