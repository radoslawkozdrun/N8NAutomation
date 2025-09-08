import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const UserFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onBulkAction,
  selectedUsers,
  totalUsers 
}) => {
  const roleOptions = [
    { value: '', label: 'Wszystkie role' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'USER', label: 'Użytkownik' },
    { value: 'DEMO', label: 'Demo' }
  ];

  const statusOptions = [
    { value: '', label: 'Wszystkie statusy' },
    { value: 'ACTIVE', label: 'Aktywny' },
    { value: 'INACTIVE', label: 'Nieaktywny' }
  ];

  const bulkActionOptions = [
    { value: '', label: 'Wybierz akcję...' },
    { value: 'activate', label: 'Aktywuj zaznaczonych' },
    { value: 'deactivate', label: 'Dezaktywuj zaznaczonych' },
    { value: 'change_role_user', label: 'Zmień rolę na USER' },
    { value: 'change_role_demo', label: 'Zmień rolę na DEMO' },
    { value: 'export', label: 'Eksportuj zaznaczonych' }
  ];

  const handleBulkAction = (action) => {
    if (action && selectedUsers?.length > 0) {
      onBulkAction(action, selectedUsers);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Search and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Szukaj użytkowników..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="md:col-span-2"
        />
        
        <Select
          placeholder="Filtruj po roli"
          options={roleOptions}
          value={filters?.role}
          onChange={(value) => onFilterChange('role', value)}
        />
        
        <Select
          placeholder="Filtruj po statusie"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />
      </div>
      {/* Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Znaleziono {totalUsers} użytkowników
            {selectedUsers?.length > 0 && (
              <span className="ml-2 text-primary">
                ({selectedUsers?.length} zaznaczonych)
              </span>
            )}
          </p>
          
          {selectedUsers?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Select
                placeholder="Akcje masowe"
                options={bulkActionOptions}
                value=""
                onChange={handleBulkAction}
                className="min-w-48"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName="X"
            iconSize={16}
          >
            Wyczyść filtry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;