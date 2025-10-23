import React from 'react';
import Icon from '../AppIcon';

interface FeedStats {
  active?: number;
  errors?: number;
  inactive?: number;
}

interface RecentError {
  id: number;
  feedName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface FeedHealthMonitorProps {
  feedStats?: FeedStats;
  recentErrors?: RecentError[];
  onViewDetails?: () => void;
  className?: string;
}

const FeedHealthMonitor: React.FC<FeedHealthMonitorProps> = ({ 
  feedStats = {},
  recentErrors = [],
  onViewDetails,
  className = '' 
}) => {
  const healthItems = [
    {
      key: 'active',
      label: 'Active Sources',
      count: feedStats?.active || 0,
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: 'CheckCircle'
    },
    {
      key: 'errors',
      label: 'Connection Errors',
      count: feedStats?.errors || 0,
      color: 'text-error',
      bgColor: 'bg-error/10',
      icon: 'AlertTriangle'
    },
    {
      key: 'inactive',
      label: 'Nieaktywne',
      count: feedStats?.inactive || 0,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      icon: 'Pause'
    }
  ];

  const getErrorSeverity = (severity: string) => {
    switch (severity) {
      case 'high':
        return { color: 'text-error', bgColor: 'bg-error/10' };
      case 'medium':
        return { color: 'text-warning', bgColor: 'bg-warning/10' };
      case 'low':
        return { color: 'text-muted-foreground', bgColor: 'bg-muted' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Teraz';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} godz. temu`;
    return `${Math.floor(diffInMinutes / 1440)} dni temu`;
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            RSS Sources Monitoring
          </h3>
          <button
            onClick={onViewDetails}
            className="text-sm text-primary hover:text-primary/80 transition-hover"
          >
            View Details
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* Health Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {healthItems.map((item) => (
            <div 
              key={item.key}
              className="flex items-center space-x-3 p-4 rounded-lg border border-border"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <Icon name={item.icon} size={20} className={item.color} />
              </div>
              <div>
                <p className="text-xl font-semibold text-card-foreground">
                  {item.count}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Errors */}
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-card-foreground mb-4">
            Recent Errors
          </h4>
          {recentErrors.length === 0 ? (
            <div className="text-center py-4">
              <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No recent errors
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentErrors.slice(0, 3).map((error) => {
                const { color, bgColor } = getErrorSeverity(error.severity);
                return (
                  <div key={error.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {error.feedName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {error.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(error.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentErrors.length > 3 && (
                <button
                  onClick={onViewDetails}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 transition-hover py-2"
                >
                  View all errors ({recentErrors.length - 3} more)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedHealthMonitor;