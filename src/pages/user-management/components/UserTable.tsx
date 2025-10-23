import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DataTable, { Column } from '../../../components/ui/DataTable';
import { User } from '../../../types';
import { cn } from '../../../lib/utils';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
  onViewActivity: (user: User) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewActivity,
  onSort,
  sortField,
  sortDirection
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'DEMO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatLastLogin = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: Column[] = [
    {
      key: 'username',
      label: 'User',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.username}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          getRoleColor(value)
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          getStatusColor(value)
        )}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700">
          {formatLastLogin(value)}
        </span>
      )
    },
    {
      key: 'articleReviews',
      label: 'Reviews',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {value || 0}
        </span>
      )
    },
    {
      key: 'loginCount',
      label: 'Logins',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {value || 0}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            iconName="Edit"
            iconSize={14}
            title="Edit user"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewActivity(row)}
            iconName="Activity"
            iconSize={14}
            title="View activity"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(row)}
            iconName={row.is_active ? 'UserX' : 'UserCheck'}
            iconSize={14}
            title={row.is_active ? 'Deactivate' : 'Activate'}
            className={row.is_active ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            iconName="Trash2"
            iconSize={14}
            title="Delete user"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      keyField="id"
      onSort={(field, direction) => {
        onSort(field);
      }}
      sortField={sortField}
      sortDirection={sortDirection}
      initialColumnWidths={{
        username: 250,
        role: 120,
        is_active: 120,
        last_login: 180,
        articleReviews: 100,
        loginCount: 100,
        actions: 220
      }}
      storageKey="user-table-column-widths"
      emptyMessage="No users found"
    />
  );
};

export default UserTable;