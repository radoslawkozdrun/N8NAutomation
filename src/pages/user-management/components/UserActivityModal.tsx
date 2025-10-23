import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserActivityModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const activityData = [
    {
      id: 1,
      type: 'LOGIN',
      description: 'System login',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'IP: 192.168.1.100'
    },
    {
      id: 2,
      type: 'ARTICLE_REVIEW',
      description: 'Article review: "New trends in React 18"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      details: 'Status: ACCEPTED, Score: 8.5/10'
    },
    {
      id: 3,
      type: 'ARTICLE_REVIEW',
      description: 'Article review: "TypeScript in practice"',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      details: 'Status: NEEDS_MORE, Note: Requires more examples'
    },
    {
      id: 4,
      type: 'LOGIN',
      description: 'System login',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      details: 'IP: 192.168.1.100'
    },
    {
      id: 5,
      type: 'BULK_ACTION',
      description: 'Bulk acceptance of 5 articles',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: 'Kategoria: AI_ML'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LOGIN':
        return 'LogIn';
      case 'ARTICLE_REVIEW':
        return 'FileText';
      case 'BULK_ACTION':
        return 'Package';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'LOGIN':
        return 'text-primary';
      case 'ARTICLE_REVIEW':
        return 'text-success';
      case 'BULK_ACTION':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp?.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date?.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">User Activity</h2>
              <p className="text-sm text-muted-foreground">{user?.username} ({user?.email})</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* User Stats Summary */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{user?.articleReviews}</p>
              <p className="text-sm text-muted-foreground">Article Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{user?.loginCount}</p>
              <p className="text-sm text-muted-foreground">Logins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">
                {user?.role === 'ADMIN' ? '∞' : '50'}
              </p>
              <p className="text-sm text-muted-foreground">Daily Limit</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-card-foreground">
                {formatLastLogin(user?.lastLogin)}
              </p>
              <p className="text-sm text-muted-foreground">Last Login</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 overflow-y-auto max-h-96">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Activity History</h3>
          <div className="space-y-4">
            {activityData?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {activity?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity?.details}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(activity?.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            iconName="Download"
            iconPosition="left"
          >
            Export Report
          </Button>
          <Button
            variant="default"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityModal;