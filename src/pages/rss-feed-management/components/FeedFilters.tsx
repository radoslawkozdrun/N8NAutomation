import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FeedFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  selectedFeeds, 
  onBulkAction 
}) => {
  const categoryOptions = [
    { value: '', label: 'Wszystkie kategorie' },
    { value: 'AI_ML', label: 'AI & Machine Learning' },
    { value: 'WEB_DEV', label: 'Web Development' },
    { value: 'MOBILE_DEV', label: 'Mobile Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'Internet of Things' },
    { value: 'OTHER', label: 'Inne' }
  ];

  const statusOptions = [
    { value: '', label: 'Wszystkie statusy' },
    { value: 'active', label: 'Aktywny' },
    { value: 'inactive', label: 'Nieaktywny' },
    { value: 'error', label: 'Błąd' }
  ];

  const healthOptions = [
    { value: '', label: 'Wszystkie kondycje' },
    { value: 'excellent', label: 'Doskonała' },
    { value: 'good', label: 'Dobra' },
    { value: 'warning', label: 'Ostrzeżenie' },
    { value: 'critical', label: 'Krytyczna' }
  ];

  const bulkActionOptions = [
    { value: '', label: 'Akcje grupowe' },
    { value: 'activate', label: 'Aktywuj wybrane' },
    { value: 'deactivate', label: 'Dezaktywuj wybrane' },
    { value: 'refresh', label: 'Odśwież wybrane' },
    { value: 'delete', label: 'Usuń wybrane' }
  ];

  const handleBulkAction = (action) => {
    if (action && selectedFeeds?.length > 0) {
      onBulkAction(action, selectedFeeds);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Szukaj źródeł RSS..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Wyczyść filtry
          </Button>
        </div>
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          placeholder="Kategoria"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => onFilterChange('category', value)}
        />
        
        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />
        
        <Select
          placeholder="Kondycja"
          options={healthOptions}
          value={filters?.health}
          onChange={(value) => onFilterChange('health', value)}
        />

        {/* Bulk Actions */}
        <div className="flex items-center space-x-2">
          <Select
            placeholder="Akcje grupowe"
            options={bulkActionOptions}
            value=""
            onChange={handleBulkAction}
            disabled={selectedFeeds?.length === 0}
            className="flex-1"
          />
          {selectedFeeds?.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              <Icon name="Check" size={14} />
              <span>{selectedFeeds?.length}</span>
            </div>
          )}
        </div>
      </div>
      {/* Active Filters Display */}
      {(filters?.search || filters?.category || filters?.status || filters?.health) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Aktywne filtry:</span>
          
          {filters?.search && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="Search" size={12} />
              <span>"{filters?.search}"</span>
              <button
                onClick={() => onFilterChange('search', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          
          {filters?.category && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="Tag" size={12} />
              <span>{categoryOptions?.find(opt => opt?.value === filters?.category)?.label}</span>
              <button
                onClick={() => onFilterChange('category', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          
          {filters?.status && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="Activity" size={12} />
              <span>{statusOptions?.find(opt => opt?.value === filters?.status)?.label}</span>
              <button
                onClick={() => onFilterChange('status', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          
          {filters?.health && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="Heart" size={12} />
              <span>{healthOptions?.find(opt => opt?.value === filters?.health)?.label}</span>
              <button
                onClick={() => onFilterChange('health', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedFilters;