import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  Grid,
  List,
  RefreshCw,
} from 'lucide-react';
import { ArticleFilters as FilterType, ArticleCategory, Priority, TargetAudience } from '@/types';
import { 
  getCategoryLabel, 
  getPriorityLabel, 
  getAudienceLabel,
} from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ArticleFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  sortBy: 'final_score' | 'created_date' | 'priority';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'final_score' | 'created_date' | 'priority', order: 'asc' | 'desc') => void;
  totalCount: number;
  selectedCount: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ArticleFilters({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalCount,
  selectedCount,
  onRefresh,
  isLoading,
}: ArticleFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const categories: ArticleCategory[] = [
    'AI_ML', 'WEB_DEV', 'MOBILE_DEV', 'DATA_SCIENCE', 'DEVOPS', 
    'SECURITY', 'CLOUD', 'BLOCKCHAIN', 'IOT', 'OTHER'
  ];

  const priorities: Priority[] = [
    'P0_BREAKING', 'P1_TRENDING', 'P2_TIMELY', 'P3_EVERGREEN', 'P4_FILLER'
  ];

  const audiences: TargetAudience[] = [
    'developers', 'architects', 'managers', 'beginners', 'experts', 'mixed'
  ];

  const quickFilters = [
    { label: 'High Score (>80)', filter: { score_min: 80 } },
    { label: 'Trending (P1)', filter: { priority: 'P1_TRENDING' as Priority } },
    { label: 'AI/ML Only', filter: { category: 'AI_ML' as ArticleCategory } },
    { label: 'Breaking News', filter: { priority: 'P0_BREAKING' as Priority } },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchTerm.trim() || undefined });
  };

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="p-4 space-y-4">
        {/* Top row: Search, View Mode, Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles, tags, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onFiltersChange({ ...filters, search: undefined });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Results count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalCount} articles
              {selectedCount > 0 && (
                <span className="ml-1 text-blue-600 dark:text-blue-400">
                  ({selectedCount} selected)
                </span>
              )}
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              loading={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => onViewModeChange('cards')}
                className={`p-2 ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-2 ${
                  viewMode === 'table'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                onSortChange(
                  field as 'final_score' | 'created_date' | 'priority', 
                  order as 'asc' | 'desc'
                );
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="final_score_desc">Score (High to Low)</option>
              <option value="final_score_asc">Score (Low to High)</option>
              <option value="created_date_desc">Date (Newest)</option>
              <option value="created_date_asc">Date (Oldest)</option>
              <option value="priority_asc">Priority (High to Low)</option>
            </select>

            {/* Advanced filters toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge size="sm" className="ml-2 bg-blue-600 text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick filters:
          </span>
          {quickFilters.map((quickFilter) => (
            <button
              key={quickFilter.label}
              onClick={() => handleFilterChange(quickFilter.filter)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
            >
              {quickFilter.label}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => 
                  handleFilterChange({ 
                    category: e.target.value as ArticleCategory || undefined 
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => 
                  handleFilterChange({ 
                    priority: e.target.value as Priority || undefined 
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={filters.target_audience || ''}
                onChange={(e) => 
                  handleFilterChange({ 
                    target_audience: e.target.value as TargetAudience || undefined 
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Audiences</option>
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {getAudienceLabel(audience)}
                  </option>
                ))}
              </select>
            </div>

            {/* Score range */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score Range
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.score_min || ''}
                  onChange={(e) => 
                    handleFilterChange({ 
                      score_min: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.score_max || ''}
                  onChange={(e) => 
                    handleFilterChange({ 
                      score_max: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}