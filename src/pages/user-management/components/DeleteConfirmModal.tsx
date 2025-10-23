import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, user, isLoading }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">Confirm Deletion</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete user <strong className="text-card-foreground">{user?.username}</strong>?
          </p>
          
          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-error mb-1">This action is irreversible</p>
                <ul className="text-error/80 space-y-1">
                  <li>• All user data will be deleted</li>
                  <li>• Article review history will be preserved</li>
                  <li>• User will lose access to the system</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-card-foreground mb-2">User Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-card-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="text-card-foreground">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Article Reviews:</span>
                <span className="text-card-foreground">{user?.articleReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logins:</span>
                <span className="text-card-foreground">{user?.loginCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={isLoading}
            iconName="Trash2"
            iconPosition="left"
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;