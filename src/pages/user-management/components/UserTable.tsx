import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserTable = ({ users, onEdit, onToggleStatus, onDelete, onViewActivity, onSort, sortField, sortDirection }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-error text-error-foreground';
      case 'USER':
        return 'bg-primary text-primary-foreground';
      case 'DEMO':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ?'bg-success text-success-foreground' :'bg-muted text-muted-foreground';
  };

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Nigdy';
    const date = new Date(timestamp);
    return date?.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field) => {
    onSort(field);
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-muted-foreground hover:text-foreground transition-hover"
    >
      <span>{children}</span>
      {sortField === field && (
        <Icon 
          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
        />
      )}
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="name">Użytkownik</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="role">Rola</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="lastLogin">Ostatnie logowanie</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="articleReviews">Przeglądy</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="loginCount">Logowania</SortButton>
              </th>
              <th className="px-6 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user?.id} className="hover:bg-muted/50 transition-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.status)}`}>
                    {user?.status === 'ACTIVE' ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatLastLogin(user?.lastLogin)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                  {user?.articleReviews}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                  {user?.loginCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      iconName="Edit"
                      iconSize={16}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewActivity(user)}
                      iconName="Activity"
                      iconSize={16}
                    >
                      Aktywność
                    </Button>
                    <Button
                      variant={user?.status === 'ACTIVE' ? 'warning' : 'success'}
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                      iconName={user?.status === 'ACTIVE' ? 'UserX' : 'UserCheck'}
                      iconSize={16}
                    >
                      {user?.status === 'ACTIVE' ? 'Dezaktywuj' : 'Aktywuj'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(user)}
                      iconName="Trash2"
                      iconSize={16}
                    >
                      Usuń
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;