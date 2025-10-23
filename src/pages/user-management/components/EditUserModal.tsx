import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EditUserModal = ({ isOpen, onClose, onUpdateUser, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'USER', label: 'User', description: 'Basic permissions for viewing and reviewing articles' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full system management permissions' },
    { value: 'DEMO', label: 'Demo', description: 'Limited demonstration permissions' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.username || '',
        email: user?.email || '',
        role: user?.role || 'USER',
        status: user?.is_active ? 'ACTIVE' : 'INACTIVE'
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Username is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Invalid email address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const updatedUser = {
        ...user,
        ...formData,
        updatedAt: new Date()?.toISOString()
      };

      await onUpdateUser(updatedUser);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Error occurred while updating user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Edit User</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="Enter username"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <Select
            label="User Role"
            options={roleOptions}
            value={formData?.role}
            onChange={(value) => handleInputChange('role', value)}
            description="Select appropriate permission level"
          />

          <Select
            label="Account Status"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
          />

          {/* User Stats */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">User Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Article Reviews:</span>
                <span className="ml-2 font-medium text-card-foreground">{user?.articleReviews}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Logins:</span>
                <span className="ml-2 font-medium text-card-foreground">{user?.loginCount}</span>
              </div>
            </div>
          </div>

          {errors?.submit && (
            <div className="flex items-center space-x-2 text-sm text-error">
              <Icon name="AlertCircle" size={16} />
              <span>{errors?.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;