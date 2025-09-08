import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

interface PendingCounts {
  NEW?: number;
  PENDING_REVIEW?: number;
  NEEDS_MORE?: number;
}

interface PendingArticlesOverviewProps {
  pendingCounts?: PendingCounts;
  onViewAll?: () => void;
  onQuickAction?: (action: string) => void;
  className?: string;
}

const PendingArticlesOverview: React.FC<PendingArticlesOverviewProps> = ({ 
  pendingCounts = {}, 
  onViewAll,
  onQuickAction,
  className = '' 
}) => {
  const statusItems = [
    {
      key: 'NEW',
      label: 'Nowe',
      count: pendingCounts?.NEW || 0,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      icon: 'Plus'
    },
    {
      key: 'PENDING_REVIEW',
      label: 'Oczekujące',
      count: pendingCounts?.PENDING_REVIEW || 0,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      icon: 'Clock'
    },
    {
      key: 'NEEDS_MORE',
      label: 'Wymaga więcej',
      count: pendingCounts?.NEEDS_MORE || 0,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      icon: 'AlertCircle'
    }
  ];

  const totalPending = statusItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            Przegląd oczekujących artykułów
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewAll}
          >
            Zobacz wszystkie
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statusItems.map((item) => (
            <div 
              key={item.key}
              className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-hover cursor-pointer"
              onClick={() => onQuickAction && onQuickAction(item.key)}
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <Icon name={item.icon} size={20} className={item.color} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-card-foreground">
                  {item.count}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">
              Łącznie oczekujących artykułów
            </p>
            <p className="text-xl font-semibold text-card-foreground">
              {totalPending}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onQuickAction && onQuickAction('BULK_ACCEPT')}
              className="flex items-center space-x-2"
            >
              <Icon name="Package" size={16} />
              <span>Masowa akceptacja</span>
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onQuickAction && onQuickAction('HIGH_PRIORITY')}
              className="flex items-center space-x-2"
            >
              <Icon name="Eye" size={16} />
              <span>Wysokie priorytety</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingArticlesOverview;