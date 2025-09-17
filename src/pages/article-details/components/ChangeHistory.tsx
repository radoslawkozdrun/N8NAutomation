import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChangeHistory = ({ history }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const getActionIcon = (action) => {
    const icons = {
      'created': 'Plus',
      'status_changed': 'GitBranch',
      'reviewed': 'Eye',
      'accepted': 'Check',
      'rejected': 'X',
      'needs_more': 'AlertCircle',
      'archived': 'Archive',
      'updated': 'Edit'
    };
    return icons?.[action] || 'Activity';
  };

  const getActionColor = (action) => {
    const colors = {
      'created': 'text-blue-600',
      'status_changed': 'text-purple-600',
      'reviewed': 'text-yellow-600',
      'accepted': 'text-green-600',
      'rejected': 'text-red-600',
      'needs_more': 'text-orange-600',
      'archived': 'text-gray-600',
      'updated': 'text-blue-600'
    };
    return colors?.[action] || 'text-gray-600';
  };

  const getActionLabel = (action) => {
    const labels = {
      'created': 'Created',
      'status_changed': 'Status Changed',
      'reviewed': 'Reviewed',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'needs_more': 'Needs More Information',
      'archived': 'Archived',
      'updated': 'Updated'
    };
    return labels?.[action] || 'Unknown Action';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayHistory = isExpanded ? history : history?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Change History</h2>
        <div className="flex items-center space-x-2">
          <Icon name="History" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">{history?.length} entries</span>
        </div>
      </div>
      <div className="space-y-4">
        {displayHistory?.map((entry, index) => (
          <div
            key={entry?.id}
            className={`flex items-start space-x-4 p-4 rounded-lg border transition-smooth ${
              selectedEntry === entry?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/30'
            }`}
          >
            {/* Timeline indicator */}
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted ${getActionColor(entry?.action)}`}>
                <Icon name={getActionIcon(entry?.action)} size={16} />
              </div>
              {index < displayHistory?.length - 1 && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {getActionLabel(entry?.action)}
                    </span>
                    {entry?.fromStatus && entry?.toStatus && (
                      <span className="text-sm text-muted-foreground">
                        {entry?.fromStatus} → {entry?.toStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>by {entry?.user}</span>
                    <span>{formatDate(entry?.timestamp)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntry(selectedEntry === entry?.id ? null : entry?.id)}
                  iconName={selectedEntry === entry?.id ? "ChevronUp" : "ChevronDown"}
                >
                  {selectedEntry === entry?.id ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {/* Expanded details */}
              {selectedEntry === entry?.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {entry?.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Notes:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {entry?.notes}
                      </p>
                    </div>
                  )}
                  
                  {entry?.changes && entry?.changes?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Changes:</h4>
                      <div className="space-y-2">
                        {entry?.changes?.map((change, idx) => (
                          <div key={idx} className="text-sm bg-muted p-2 rounded">
                            <span className="font-medium">{change?.field}:</span>
                            <span className="text-red-600 line-through ml-2">{change?.oldValue}</span>
                            <span className="text-green-600 ml-2">{change?.newValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry?.metadata && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Metadata:</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>IP: {entry?.metadata?.ip}</div>
                        <div>User Agent: {entry?.metadata?.userAgent}</div>
                        <div>Session ID: {entry?.metadata?.sessionId}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less Button */}
      {history?.length > 3 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded 
              ? `Show Less (hide ${history?.length - 3} entries)`
              : `Show All (${history?.length - 3} more)`
            }
          </Button>
        </div>
      )}
      {/* Export Options */}
      <div className="flex justify-end mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="Download" iconPosition="left">
            Export History
          </Button>
          <Button variant="ghost" size="sm" iconName="Printer" iconPosition="left">
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangeHistory;