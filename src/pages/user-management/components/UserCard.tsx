import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserCard = ({ user, onEdit, onToggleStatus, onDelete, onViewActivity }) => {
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

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Icon name="User" size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{user?.username}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
            {user?.role}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.is_active ? 'ACTIVE' : 'INACTIVE')}`}>
            {user?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {/* User Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="skote-card-title text-card-foreground">{user?.articleReviews}</p>
          <p className="skote-small-text text-muted-foreground">Article Reviews</p>
        </div>
        <div className="text-center">
          <p className="skote-card-title text-card-foreground">{user?.loginCount}</p>
          <p className="skote-small-text text-muted-foreground">Logins</p>
        </div>
      </div>
      {/* Last Login */}
      <div className="flex items-center space-x-2 skote-body-text text-muted-foreground">
        <Icon name="Clock" size={16} />
        <span>Ostatnie logowanie: {formatLastLogin(user?.lastLogin)}</span>
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            iconName="Edit"
            iconSize={16}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewActivity(user)}
            iconName="Activity"
            iconSize={16}
          >
            Activity
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={user?.is_active ? 'warning' : 'success'}
            size="sm"
            onClick={() => onToggleStatus(user)}
            iconName={user?.is_active ? 'UserX' : 'UserCheck'}
            iconSize={16}
          >
            {user?.is_active ? 'Dezaktywuj' : 'Aktywuj'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(user)}
            iconName="Trash2"
            iconSize={16}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;