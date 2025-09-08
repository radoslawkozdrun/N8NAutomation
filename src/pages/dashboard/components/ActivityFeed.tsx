import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [], className = '' }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'article_accepted':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'article_rejected':
        return { icon: 'XCircle', color: 'text-error' };
      case 'article_pending':
        return { icon: 'Clock', color: 'text-warning' };
      case 'user_login':
        return { icon: 'LogIn', color: 'text-primary' };
      case 'feed_added':
        return { icon: 'Rss', color: 'text-accent' };
      case 'bulk_operation':
        return { icon: 'Package', color: 'text-secondary' };
      default:
        return { icon: 'Activity', color: 'text-muted-foreground' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Teraz';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} godz. temu`;
    return `${Math.floor(diffInMinutes / 1440)} dni temu`;
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">
          Ostatnia aktywność
        </h3>
      </div>
      <div className="p-6">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Brak ostatniej aktywności</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => {
              const { icon, color } = getActivityIcon(activity?.type);
              return (
                <div key={activity?.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                    <Icon name={icon} size={16} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">
                      <span className="font-medium">{activity?.user}</span>
                      {' '}
                      <span>{activity?.action}</span>
                      {activity?.target && (
                        <span className="text-primary"> {activity?.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity?.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;