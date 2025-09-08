import React from 'react';
import Icon from '../AppIcon';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description,
  onClick,
  className = '' 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      case 'neutral':
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      case 'neutral':
      default:
        return 'Minus';
    }
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-card transition-hover ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-semibold text-card-foreground mb-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center space-x-1 text-xs ${getChangeColor()}`}>
              <Icon name={getChangeIcon()} size={12} />
              <span>{change}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;