import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const FilterToolbar = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  totalArticles,
  filteredCount,
  selectedArticles,
  onBulkAction 
}) => {

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'NEW', label: 'New' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'NEEDS_MORE', label: 'Needs More' },
    { value: 'RESEARCH_DONE', label: 'Research Done' }
  ];

  const categoryOptions = [
    { value: '', label: 'All categories' },
    { value: 'AI_ML', label: 'AI & Machine Learning' },
    { value: 'WEB_DEV', label: 'Web Development' },
    { value: 'MOBILE_DEV', label: 'Mobile Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'Internet of Things' },
    { value: 'OTHER', label: 'Other' }
  ];

  const priorityOptions = [
    { value: '', label: 'All priorities' },
    { value: 'P0_BREAKING', label: 'P0 - Breaking' },
    { value: 'P1_TRENDING', label: 'P1 - Trending' },
    { value: 'P2_TIMELY', label: 'P2 - Timely' },
    { value: 'P3_EVERGREEN', label: 'P3 - Evergreen' },
    { value: 'P4_FILLER', label: 'P4 - Filler' }
  ];

  const targetAudienceOptions = [
    { value: '', label: 'All audiences' },
    { value: 'developers', label: 'Developers' },
    { value: 'architects', label: 'Architects' },
    { value: 'managers', label: 'Managers' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'experts', label: 'Experts' },
    { value: 'mixed', label: 'Mixed' }
  ];


  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };



  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Search
          </label>
          <Input
            type="search"
            placeholder="Search in titles, content, authors and tags..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Category
          </label>
          <Select
            placeholder="All categories"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Status
          </label>
          <Select
            placeholder="All statuses"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Priority
          </label>
          <Select
            placeholder="All priorities"
            options={priorityOptions}
            value={filters?.priority}
            onChange={(value) => handleFilterChange('priority', value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Actions
          </label>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full h-[42px] py-2"
          >
            <Icon name="X" size={14} className="mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      {/* Active Filters Display */}
      {(filters?.search || filters?.status || filters?.category || filters?.priority) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters?.search && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="Search" size={12} />
              <span>"{filters?.search}"</span>
              <button
                onClick={() => handleFilterChange('search', '')}
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
                onClick={() => handleFilterChange('status', '')}
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
                onClick={() => handleFilterChange('category', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          
          {filters?.priority && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <Icon name="AlertTriangle" size={12} />
              <span>{priorityOptions?.find(opt => opt?.value === filters?.priority)?.label}</span>
              <button
                onClick={() => handleFilterChange('priority', '')}
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

export default FilterToolbar;