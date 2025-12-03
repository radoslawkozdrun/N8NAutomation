import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { User, UserFilters as UserFiltersType } from '../../../types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (field: keyof UserFiltersType, value: any) => void;
  onClearFilters: () => void;
  onBulkAction: (action: string, userIds: number[]) => void;
  selectedUsers: User[];
  totalUsers: number;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onBulkAction,
  selectedUsers,
  totalUsers
}) => {
  const roleOptions = [
    { value: '', label: 'All roles' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'USER', label: 'User' },
    { value: 'DEMO', label: 'Demo' }
  ];

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const bulkActionOptions = [
    { value: '', label: 'Select action...' },
    { value: 'activate', label: 'Activate selected' },
    { value: 'deactivate', label: 'Deactivate selected' },
    { value: 'change_role_user', label: 'Change role to USER' },
    { value: 'change_role_demo', label: 'Change role to DEMO' },
    { value: 'export', label: 'Export selected' }
  ];

  const handleBulkAction = (action: string) => {
    if (action && selectedUsers?.length > 0) {
      onBulkAction(action, selectedUsers.map(u => u.id));
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Search and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search users..."
          value={filters?.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="md:col-span-2"
        />

        <Select
          label="Role"
          options={roleOptions}
          value={filters?.role || ''}
          onChange={(value) => onFilterChange('role', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.active === undefined ? '' : (filters.active ? 'ACTIVE' : 'INACTIVE')}
          onChange={(value) => onFilterChange('active', value === 'ACTIVE' ? true : (value === 'INACTIVE' ? false : undefined))}
        />
      </div>
      {/* Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Found {totalUsers} users
            {selectedUsers?.length > 0 && (
              <span className="ml-2 text-primary">
                ({selectedUsers?.length} selected)
              </span>
            )}
          </p>

          {selectedUsers?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Select
                label="Bulk Actions"
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
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;