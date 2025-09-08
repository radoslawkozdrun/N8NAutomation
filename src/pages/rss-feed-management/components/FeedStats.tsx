import React from 'react';
import Icon from '../../../components/AppIcon';

const FeedStats = ({ feeds }) => {
  const totalFeeds = feeds?.length;
  const activeFeeds = feeds?.filter(feed => feed?.status === 'active')?.length;
  const errorFeeds = feeds?.filter(feed => feed?.status === 'error')?.length;
  const totalArticles = feeds?.reduce((sum, feed) => sum + feed?.articlesCount, 0);
  
  const avgResponseTime = feeds?.length > 0 
    ? Math.round(feeds?.reduce((sum, feed) => sum + feed?.responseTime, 0) / feeds?.length)
    : 0;

  const healthDistribution = feeds?.reduce((acc, feed) => {
    acc[feed.health] = (acc?.[feed?.health] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = feeds?.reduce((acc, feed) => {
    feed?.categories?.forEach(category => {
      acc[category] = (acc?.[category] || 0) + 1;
    });
    return acc;
  }, {});

  const topCategories = Object.entries(categoryDistribution)?.sort(([,a], [,b]) => b - a)?.slice(0, 5);

  const stats = [
    {
      label: 'Łączna liczba źródeł',
      value: totalFeeds,
      icon: 'Rss',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Aktywne źródła',
      value: activeFeeds,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Źródła z błędami',
      value: errorFeeds,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Łączna liczba artykułów',
      value: totalArticles?.toLocaleString('pl-PL'),
      icon: 'FileText',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
                <Icon name={stat?.icon} size={20} className={stat?.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                <p className="text-sm text-muted-foreground">{stat?.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Heart" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-foreground">Kondycja źródeł</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(healthDistribution)?.map(([health, count]) => {
              const percentage = totalFeeds > 0 ? (count / totalFeeds) * 100 : 0;
              const healthConfig = {
                excellent: { label: 'Doskonała', color: 'bg-success', textColor: 'text-success' },
                good: { label: 'Dobra', color: 'bg-primary', textColor: 'text-primary' },
                warning: { label: 'Ostrzeżenie', color: 'bg-warning', textColor: 'text-warning' },
                critical: { label: 'Krytyczna', color: 'bg-error', textColor: 'text-error' }
              };
              
              const config = healthConfig?.[health] || { label: health, color: 'bg-muted', textColor: 'text-muted-foreground' };
              
              return (
                <div key={health} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${config?.color}`} />
                    <span className="text-sm text-foreground">{config?.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{count}</span>
                    <span className="text-xs text-muted-foreground">({percentage?.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Średni czas odpowiedzi</span>
              <span className="font-medium text-foreground">{avgResponseTime}ms</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Tag" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-foreground">Najpopularniejsze kategorie</h3>
          </div>
          
          <div className="space-y-3">
            {topCategories?.map(([category, count], index) => {
              const percentage = totalFeeds > 0 ? (count / totalFeeds) * 100 : 0;
              const categoryLabels = {
                'AI_ML': 'AI & Machine Learning',
                'WEB_DEV': 'Web Development',
                'MOBILE_DEV': 'Mobile Development',
                'DATA_SCIENCE': 'Data Science',
                'DEVOPS': 'DevOps',
                'SECURITY': 'Security',
                'CLOUD': 'Cloud Computing',
                'BLOCKCHAIN': 'Blockchain',
                'IOT': 'Internet of Things',
                'OTHER': 'Inne'
              };
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {categoryLabels?.[category] || category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage?.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {topCategories?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Tag" size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Brak danych o kategoriach</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedStats;