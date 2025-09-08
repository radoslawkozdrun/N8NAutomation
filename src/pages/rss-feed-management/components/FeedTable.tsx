import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeedTable = ({ feeds, onEdit, onDelete, onRefresh, onBulkAction, selectedFeeds, onSelectFeed, onSelectAll }) => {
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFeeds = [...feeds]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (sortField === 'lastUpdated') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10 border-success/20';
      case 'inactive':
        return 'text-muted-foreground bg-muted border-border';
      case 'error':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'text-success';
      case 'good':
        return 'text-primary';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedFeeds?.length === feeds?.length && feeds?.length > 0}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('url')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Źródło RSS</span>
                  <Icon 
                    name={sortField === 'url' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Kategoria</span>
                  <Icon 
                    name={sortField === 'category' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Status</span>
                  <Icon 
                    name={sortField === 'status' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={() => handleSort('lastUpdated')}
                  className="flex items-center space-x-1 hover:text-primary transition-hover"
                >
                  <span>Ostatnia aktualizacja</span>
                  <Icon 
                    name={sortField === 'lastUpdated' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={16} 
                  />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Kondycja</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedFeeds?.map((feed) => (
              <tr key={feed?.id} className="hover:bg-muted/30 transition-hover">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFeeds?.includes(feed?.id)}
                    onChange={(e) => onSelectFeed(feed?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-foreground truncate" title={feed?.url}>
                      {feed?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={feed?.url}>
                      {feed?.url}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {feed?.categories?.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feed?.status)}`}>
                    <Icon 
                      name={feed?.status === 'active' ? 'CheckCircle' : feed?.status === 'error' ? 'XCircle' : 'Pause'} 
                      size={12} 
                      className="mr-1" 
                    />
                    {feed?.status === 'active' ? 'Aktywny' : feed?.status === 'error' ? 'Błąd' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{formatDate(feed?.lastUpdated)}</p>
                  <p className="text-xs text-muted-foreground">{feed?.articlesCount} artykułów</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={feed?.health === 'excellent' ? 'CheckCircle' : feed?.health === 'good' ? 'Circle' : feed?.health === 'warning' ? 'AlertTriangle' : 'XCircle'} 
                      size={16} 
                      className={getHealthColor(feed?.health)} 
                    />
                    <div>
                      <p className={`text-xs font-medium ${getHealthColor(feed?.health)}`}>
                        {feed?.health === 'excellent' ? 'Doskonała' : 
                         feed?.health === 'good' ? 'Dobra' : 
                         feed?.health === 'warning' ? 'Ostrzeżenie' : 'Krytyczna'}
                      </p>
                      <p className="text-xs text-muted-foreground">{feed?.responseTime}ms</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRefresh(feed?.id)}
                      className="h-8 w-8"
                    >
                      <Icon name="RefreshCw" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(feed)}
                      className="h-8 w-8"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(feed?.id)}
                      className="h-8 w-8 text-error hover:text-error"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedFeeds?.map((feed) => (
          <div key={feed?.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedFeeds?.includes(feed?.id)}
                  onChange={(e) => onSelectFeed(feed?.id, e?.target?.checked)}
                  className="rounded border-border mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">{feed?.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{feed?.url}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRefresh(feed?.id)}
                  className="h-8 w-8"
                >
                  <Icon name="RefreshCw" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(feed)}
                  className="h-8 w-8"
                >
                  <Icon name="Edit" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(feed?.id)}
                  className="h-8 w-8 text-error hover:text-error"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {feed?.categories?.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {category}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feed?.status)}`}>
                <Icon 
                  name={feed?.status === 'active' ? 'CheckCircle' : feed?.status === 'error' ? 'XCircle' : 'Pause'} 
                  size={12} 
                  className="mr-1" 
                />
                {feed?.status === 'active' ? 'Aktywny' : feed?.status === 'error' ? 'Błąd' : 'Nieaktywny'}
              </span>
              
              <div className="flex items-center space-x-2">
                <Icon 
                  name={feed?.health === 'excellent' ? 'CheckCircle' : feed?.health === 'good' ? 'Circle' : feed?.health === 'warning' ? 'AlertTriangle' : 'XCircle'} 
                  size={16} 
                  className={getHealthColor(feed?.health)} 
                />
                <span className={`text-xs font-medium ${getHealthColor(feed?.health)}`}>
                  {feed?.health === 'excellent' ? 'Doskonała' : 
                   feed?.health === 'good' ? 'Dobra' : 
                   feed?.health === 'warning' ? 'Ostrzeżenie' : 'Krytyczna'}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Ostatnia aktualizacja: {formatDate(feed?.lastUpdated)}</p>
              <p>{feed?.articlesCount} artykułów • {feed?.responseTime}ms</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedTable;