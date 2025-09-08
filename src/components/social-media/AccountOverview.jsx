import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

const AccountOverview = ({ stats, isLoading }) => {
  const overviewCards = [
    {
      title: 'Łączna liczba kont',
      value: stats?.total || 0,
      icon: 'Users',
      color: 'bg-primary',
      description: 'Wszystkie połączone konta'
    },
    {
      title: 'Aktywne połączenia',
      value: stats?.connected || 0,
      icon: 'CheckCircle',
      color: 'bg-success',
      description: 'Prawidłowo działające konta'
    },
    {
      title: 'Błędy połączeń',
      value: stats?.errors || 0,
      icon: 'XCircle',
      color: 'bg-error',
      description: 'Konta wymagające uwagi'
    },
    {
      title: 'Ostrzeżenia',
      value: stats?.warnings || 0,
      icon: 'AlertTriangle',
      color: 'bg-warning',
      description: 'Konta z problemami'
    }
  ];

  const platformCards = [
    {
      platform: 'Twitter',
      count: stats?.platforms?.twitter || 0,
      icon: 'Twitter',
      color: 'bg-sky-500'
    },
    {
      platform: 'LinkedIn',
      count: stats?.platforms?.linkedin || 0,
      icon: 'Linkedin',
      color: 'bg-blue-700'
    },
    {
      platform: 'Instagram',
      count: stats?.platforms?.instagram || 0,
      icon: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      platform: 'Blog',
      count: stats?.platforms?.blog || 0,
      icon: 'FileText',
      color: 'bg-gray-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards?.map((card, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {card?.title}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-foreground">
                    {card?.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card?.description}
                </p>
              </div>
              
              <div className={cn("p-3 rounded-lg", card?.color)}>
                <Icon name={card?.icon} size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Rozkład platform
          </h3>
          <div className="text-sm text-muted-foreground">
            {stats?.total || 0} kont w {platformCards?.filter(p => p?.count > 0)?.length || 0} platformach
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platformCards?.map((platform, index) => (
            <div 
              key={index}
              className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg"
            >
              <div className={cn("p-2 rounded", platform?.color)}>
                <Icon name={platform?.icon} size={16} className="text-white" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {platform?.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  {platform?.platform}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Health Bar */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Stan połączeń
            </span>
            <span className="text-xs text-muted-foreground">
              {stats?.connected}/{stats?.total} aktywnych
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              {/* Connected portion */}
              <div 
                className="bg-success transition-all duration-300"
                style={{ 
                  width: `${stats?.total > 0 ? (stats?.connected / stats?.total) * 100 : 0}%` 
                }}
              ></div>
              {/* Warning portion */}
              <div 
                className="bg-warning transition-all duration-300"
                style={{ 
                  width: `${stats?.total > 0 ? (stats?.warnings / stats?.total) * 100 : 0}%` 
                }}
              ></div>
              {/* Error portion */}
              <div 
                className="bg-error transition-all duration-300"
                style={{ 
                  width: `${stats?.total > 0 ? (stats?.errors / stats?.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded"></div>
              <span>Połączone ({stats?.connected})</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-warning rounded"></div>
              <span>Ostrzeżenia ({stats?.warnings})</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-error rounded"></div>
              <span>Błędy ({stats?.errors})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;