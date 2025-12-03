import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { CreateUserRequest, UserRole } from '../../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: CreateUserRequest) => Promise<void>;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  sendNotification: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  submit?: string;
  [key: string]: string | undefined;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'USER',
    is_active: true,
    sendNotification: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'USER', label: 'User', description: 'Basic permissions for viewing and reviewing articles' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full system management permissions' },
    { value: 'DEMO', label: 'Demo', description: 'Limited demonstration permissions' }
  ];

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newUser: CreateUserRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        is_active: formData.is_active
      };

      await onAddUser(newUser);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Error occurred while adding user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'USER',
      is_active: true,
      sendNotification: true
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Add New User</h2>
          <Button
            variant="ghost"
            size="sm"
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
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={errors.username || ''}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email || ''}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password || ''}
            required
          />

          <Select
            label="User Role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => handleInputChange('role', value)}
          />

          <Select
            label="Account Status"
            options={statusOptions}
            value={formData.is_active ? 'true' : 'false'}
            onChange={(value) => handleInputChange('is_active', value === 'true')}
          />

          <Checkbox
            label="Send email notification"
            checked={formData.sendNotification}
            onChange={(checked) => handleInputChange('sendNotification', checked)}
          />

          {errors.submit && (
            <div className="flex items-center space-x-2 text-sm text-error">
              <Icon name="AlertCircle" size={16} />
              <span>{errors.submit}</span>
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
              iconName="UserPlus"
              iconPosition="left"
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;