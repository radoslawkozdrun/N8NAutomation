import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import { cn } from '../../utils/cn';

const AccountTable = ({ 
  accounts, 
  isLoading, 
  onDisconnect, 
  onRefresh, 
  onViewDetails 
}) => {
  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: 'Twitter',
      linkedin: 'Linkedin',
      instagram: 'Instagram',
      blog: 'FileText'
    };
    return icons?.[platform] || 'Globe';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: 'bg-sky-500',
      linkedin: 'bg-blue-700',
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      blog: 'bg-gray-600'
    };
    return colors?.[platform] || 'bg-muted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'connecting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'disconnected': return 'Disconnected';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'unhealthy': return 'text-error';
      case 'pending': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getRateLimitColor = (used, limit) => {
    const ratio = used / limit;
    if (ratio > 0.9) return 'text-error';
    if (ratio > 0.7) return 'text-warning';
    return 'text-success';
  };

  const formatLastSync = (date) => {
    if (!date) return 'Nigdy';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
  };

  if (accounts?.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Accounts
          </h3>
          <p className="text-gray-600 mb-6">
            No social media accounts found. Add the first account to get started.
          </p>
          <Button
            variant="default"
            iconName="Plus"
          >
            Add First Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={[
        {
          key: 'displayName',
          label: 'Account',
          sortable: true,
          render: (value, row) => (
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", getPlatformColor(row.platform))}>
                <Icon name={getPlatformIcon(row.platform)} size={16} className="text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {row.displayName}
                </div>
                <div className="text-sm text-gray-600">
                  {row.username}
                </div>
                <div className="text-xs text-gray-500">
                  {row.followers?.toLocaleString()} followers
                </div>
              </div>
            </div>
          )
        },
        {
          key: 'platform',
          label: 'Platform',
          sortable: true,
          render: (value) => (
            <span className="capitalize text-sm text-gray-700">
              {value}
            </span>
          )
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (value) => (
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getStatusColor(value)
            )}>
              {getStatusText(value)}
            </span>
          )
        },
        {
          key: 'lastSync',
          label: 'Last Sync',
          sortable: true,
          render: (value, row) => (
            <div>
              <div className="text-sm text-gray-700">
                {formatLastSync(value)}
              </div>
              {row.status === 'error' && row.errorMessage && (
                <div className="text-xs text-red-600 mt-1">
                  {row.errorMessage}
                </div>
              )}
              {row.status === 'warning' && row.warningMessage && (
                <div className="text-xs text-yellow-600 mt-1">
                  {row.warningMessage}
                </div>
              )}
            </div>
          )
        },
        {
          key: 'apiRateLimit',
          label: 'API Limits',
          render: (value, row) => (
            row.apiRateLimit ? (
              <div className="text-sm">
                <div className={cn(
                  "font-medium",
                  getRateLimitColor(row.apiRateLimit.used, row.apiRateLimit.limit)
                )}>
                  {row.apiRateLimit.used}/{row.apiRateLimit.limit}
                </div>
                <div className="text-xs text-gray-500">
                  Reset: {row.apiRateLimit.resetTime || 'N/A'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-all",
                      getRateLimitColor(row.apiRateLimit.used, row.apiRateLimit.limit)?.replace('text-', 'bg-')
                    )}
                    style={{
                      width: `${(row.apiRateLimit.used / row.apiRateLimit.limit) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ) : null
          )
        },
        {
          key: 'connectionHealth',
          label: 'Health',
          sortable: true,
          render: (value) => (
            <div className="flex items-center space-x-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                getHealthColor(value)?.replace('text-', 'bg-')
              )}></div>
              <span className="text-xs text-gray-500 capitalize">
                {value}
              </span>
            </div>
          )
        },
        {
          key: 'actions',
          label: 'Actions',
          className: 'text-right',
          headerClassName: 'text-right',
          render: (_, row) => (
            <div className="flex items-center justify-end space-x-1">
              <Button
                variant="ghost"
                size="sm"
                iconName="Eye"
                iconSize={14}
                onClick={() => onViewDetails?.(row)}
                title="View details"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="RefreshCw"
                iconSize={14}
                onClick={() => onRefresh?.(row.id)}
                disabled={row.status === 'connecting'}
                title="Refresh"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                iconSize={14}
                onClick={() => onDisconnect?.(row.id)}
                disabled={row.status === 'disconnected'}
                title="Disconnect"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              />
            </div>
          )
        }
      ]}
      data={accounts || []}
      keyField="id"
      initialColumnWidths={{
        displayName: 250,
        platform: 120,
        status: 120,
        lastSync: 180,
        apiRateLimit: 180,
        connectionHealth: 120,
        actions: 150
      }}
      storageKey="account-table-column-widths"
      isLoading={isLoading}
      emptyMessage="No social media accounts found"
    />
  );
};

export default AccountTable;