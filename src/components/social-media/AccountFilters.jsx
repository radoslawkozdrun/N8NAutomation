import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

const AccountFilters = ({
  selectedPlatform,
  selectedStatus,
  searchQuery,
  onPlatformChange,
  onStatusChange,
  onSearchChange
}) => {
  const platformOptions = [
    { value: 'all', label: 'Wszystkie platformy', icon: 'Globe' },
    { value: 'twitter', label: 'Twitter', icon: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
    { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
    { value: 'blog', label: 'Blog', icon: 'FileText' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All statuses', color: 'text-muted-foreground' },
    { value: 'connected', label: 'Connected', color: 'text-success' },
    { value: 'error', label: 'Errors', color: 'text-error' },
    { value: 'warning', label: 'Warnings', color: 'text-warning' },
    { value: 'disconnected', label: 'Disconnected', color: 'text-muted-foreground' }
  ];

  return (
    <div className="flex items-center space-x-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="Search" size={16} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e?.target?.value)}
          className={cn(
            "pl-9 pr-3 py-2 text-sm border border-input rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "placeholder:text-muted-foreground bg-background",
            "w-64"
          )}
        />
      </div>

      {/* Platform Filter */}
      <div className="relative">
        <select
          value={selectedPlatform}
          onChange={(e) => onPlatformChange?.(e?.target?.value)}
          className={cn(
            "appearance-none px-3 py-2 pr-8 text-sm border border-input rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "bg-background text-foreground cursor-pointer"
          )}
        >
          {platformOptions?.map((option) => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange?.(e?.target?.value)}
          className={cn(
            "appearance-none px-3 py-2 pr-8 text-sm border border-input rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "bg-background text-foreground cursor-pointer"
          )}
        >
          {statusOptions?.map((option) => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedPlatform !== 'all' || selectedStatus !== 'all' || searchQuery) && (
        <button
          onClick={() => {
            onPlatformChange?.('all');
            onStatusChange?.('all');
            onSearchChange?.('');
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="X" size={14} />
          <span>Clear filters</span>
        </button>
      )}
    </div>
  );
};

export default AccountFilters;