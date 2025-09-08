import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterToolbar = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  totalArticles,
  filteredCount 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'Wszystkie statusy' },
    { value: 'NEW', label: 'Nowe' },
    { value: 'PENDING_REVIEW', label: 'Oczekuje przeglądu' },
    { value: 'ACCEPTED', label: 'Zaakceptowane' },
    { value: 'REJECTED', label: 'Odrzucone' },
    { value: 'ARCHIVED', label: 'Zarchiwizowane' },
    { value: 'NEEDS_MORE', label: 'Wymaga więcej' },
    { value: 'RESEARCH_DONE', label: 'Badania zakończone' }
  ];

  const categoryOptions = [
    { value: '', label: 'Wszystkie kategorie' },
    { value: 'AI_ML', label: 'AI/ML' },
    { value: 'WEB_DEV', label: 'Rozwój Web' },
    { value: 'MOBILE_DEV', label: 'Rozwój Mobile' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'SECURITY', label: 'Bezpieczeństwo' },
    { value: 'CLOUD', label: 'Chmura' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'IoT' },
    { value: 'OTHER', label: 'Inne' }
  ];

  const priorityOptions = [
    { value: '', label: 'Wszystkie priorytety' },
    { value: 'P0_BREAKING', label: 'P0 - Pilne' },
    { value: 'P1_TRENDING', label: 'P1 - Trendy' },
    { value: 'P2_TIMELY', label: 'P2 - Aktualne' },
    { value: 'P3_EVERGREEN', label: 'P3 - Ponadczasowe' },
    { value: 'P4_FILLER', label: 'P4 - Wypełniacz' }
  ];

  const targetAudienceOptions = [
    { value: '', label: 'Wszystkie grupy' },
    { value: 'developers', label: 'Deweloperzy' },
    { value: 'architects', label: 'Architekci' },
    { value: 'managers', label: 'Menedżerowie' },
    { value: 'beginners', label: 'Początkujący' },
    { value: 'experts', label: 'Eksperci' },
    { value: 'mixed', label: 'Mieszane' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleScoreRangeChange = (type, value) => {
    onFiltersChange({
      ...filters,
      scoreRange: {
        ...filters?.scoreRange,
        [type]: parseFloat(value) || 0
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Filtry artykułów</h3>
          <div className="text-sm text-muted-foreground">
            Wyświetlane: {filteredCount} z {totalArticles} artykułów
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Wyczyść filtry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Zwiń' : 'Rozwiń'}
          </Button>
        </div>
      </div>
      {/* Search */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Szukaj w tytułach, treści, autorach i tagach..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="max-w-md"
        />
      </div>
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
        
        <Select
          label="Kategoria"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
        />
        
        <Select
          label="Priorytet"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
        />
        
        <Select
          label="Grupa docelowa"
          options={targetAudienceOptions}
          value={filters?.targetAudience}
          onChange={(value) => handleFilterChange('targetAudience', value)}
        />
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Zaawansowane filtry</h4>
          
          {/* Score Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ocena końcowa (min)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={filters?.scoreRange?.finalMin}
                onChange={(e) => handleScoreRangeChange('finalMin', e?.target?.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ocena końcowa (max)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="100"
                value={filters?.scoreRange?.finalMax}
                onChange={(e) => handleScoreRangeChange('finalMax', e?.target?.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Relevance (min)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={filters?.scoreRange?.relevanceMin}
                onChange={(e) => handleScoreRangeChange('relevanceMin', e?.target?.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Novelty (min)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={filters?.scoreRange?.noveltyMin}
                onChange={(e) => handleScoreRangeChange('noveltyMin', e?.target?.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Viral (min)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={filters?.scoreRange?.viralMin}
                onChange={(e) => handleScoreRangeChange('viralMin', e?.target?.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Data od"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
            
            <Input
              type="date"
              label="Data do"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;