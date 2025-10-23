import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { ConfigPropertyFilters } from '../../../types';

interface ConfigPropertyFiltersProps {
  filters: ConfigPropertyFilters;
  onFilterChange: (field: string, value: any) => void;
  onClearFilters: () => void;
  totalProperties: number;
}

const ConfigPropertyFiltersComponent: React.FC<ConfigPropertyFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalProperties,
}) => {
  const dataTypeOptions = [
    { value: '', label: 'All types' },
    { value: 'string', label: 'String' },
    { value: 'integer', label: 'Integer' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'json', label: 'JSON' },
    { value: 'text', label: 'Text' }
  ];

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  const encryptionOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Encrypted' },
    { value: 'false', label: 'Unencrypted' }
  ];

  const hasActiveFilters = filters.search || filters.data_type ||
    filters.is_active !== undefined || filters.is_encrypted !== undefined;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by key or description..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="Search"
                iconSize={16}
                className="absolute left-0 top-0 h-full px-3"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data Type
            </label>
            <Select
              value={filters.data_type || ''}
              onValueChange={(value) => onFilterChange('data_type', value || undefined)}
              options={dataTypeOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <Select
              value={filters.is_active !== undefined ? filters.is_active.toString() : ''}
              onValueChange={(value) => onFilterChange('is_active', value ? value === 'true' : undefined)}
              options={statusOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Encryption
            </label>
            <Select
              value={filters.is_encrypted !== undefined ? filters.is_encrypted.toString() : ''}
              onValueChange={(value) => onFilterChange('is_encrypted', value ? value === 'true' : undefined)}
              options={encryptionOptions}
            />
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                iconName="X"
                iconPosition="left"
                size="sm"
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <>Found <strong>{totalProperties}</strong> properties with applied filters</>
            ) : (
              <>Total <strong>{totalProperties}</strong> configuration properties</>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                iconName="Filter"
                iconSize={14}
              />
              <span>Active filters</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPropertyFiltersComponent;