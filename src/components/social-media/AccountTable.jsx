import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
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
      case 'connected': return 'text-success bg-success/10';
      case 'error': return 'text-error bg-error/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'disconnected': return 'text-muted-foreground bg-muted';
      case 'connecting': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Połączono';
      case 'error': return 'Błąd';
      case 'warning': return 'Ostrzeżenie';
      case 'disconnected': return 'Rozłączono';
      case 'connecting': return 'Łączenie...';
      default: return 'Nieznany';
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

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
                <div className="w-20 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (accounts?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12">
        <div className="text-center">
          <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Brak kont
          </h3>
          <p className="text-muted-foreground mb-6">
            Nie znaleziono kont społecznościowych. Dodaj pierwsze konto, aby rozpocząć.
          </p>
          <Button
            variant="default"
            iconName="Plus"
          >
            Dodaj pierwsze konto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/20 px-6 py-4 border-b border-border">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Konto</div>
          <div className="col-span-2">Platforma</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Ostatnia synchronizacja</div>
          <div className="col-span-2">Limity API</div>
          <div className="col-span-1">Stan</div>
          <div className="col-span-1">Akcje</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {accounts?.map((account) => (
          <div key={account?.id} className="px-6 py-4 hover:bg-muted/10 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Account Info */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-lg", getPlatformColor(account?.platform))}>
                    <Icon name={getPlatformIcon(account?.platform)} size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {account?.displayName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account?.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {account?.followers?.toLocaleString()} obserwujących
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div className="col-span-2">
                <span className="capitalize text-sm text-foreground">
                  {account?.platform}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(account?.status)
                )}>
                  {getStatusText(account?.status)}
                </span>
              </div>

              {/* Last Sync */}
              <div className="col-span-2">
                <div className="text-sm text-foreground">
                  {formatLastSync(account?.lastSync)}
                </div>
                {account?.status === 'error' && account?.errorMessage && (
                  <div className="text-xs text-error mt-1">
                    {account?.errorMessage}
                  </div>
                )}
                {account?.status === 'warning' && account?.warningMessage && (
                  <div className="text-xs text-warning mt-1">
                    {account?.warningMessage}
                  </div>
                )}
              </div>

              {/* API Rate Limits */}
              <div className="col-span-2">
                {account?.apiRateLimit && (
                  <div className="text-sm">
                    <div className={cn(
                      "font-medium",
                      getRateLimitColor(account?.apiRateLimit?.used, account?.apiRateLimit?.limit)
                    )}>
                      {account?.apiRateLimit?.used}/{account?.apiRateLimit?.limit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reset: {account?.apiRateLimit?.resetTime || 'N/A'}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div 
                        className={cn(
                          "h-1 rounded-full transition-all",
                          getRateLimitColor(account?.apiRateLimit?.used, account?.apiRateLimit?.limit)?.replace('text-', 'bg-')
                        )}
                        style={{ 
                          width: `${(account?.apiRateLimit?.used / account?.apiRateLimit?.limit) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Health Status */}
              <div className="col-span-1">
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getHealthColor(account?.connectionHealth)?.replace('text-', 'bg-')
                  )}></div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {account?.connectionHealth}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="Eye"
                    onClick={() => onViewDetails?.(account)}
                  >
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="RefreshCw"
                    onClick={() => onRefresh?.(account?.id)}
                    disabled={account?.status === 'connecting'}
                  >
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="X"
                    onClick={() => onDisconnect?.(account?.id)}
                    disabled={account?.status === 'disconnected'}
                    className="text-error hover:text-error"
                  >
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountTable;