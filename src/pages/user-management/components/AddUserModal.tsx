import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    sendNotification: true
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'USER', label: 'Użytkownik', description: 'Podstawowe uprawnienia do przeglądania i recenzowania artykułów' },
    { value: 'ADMIN', label: 'Administrator', description: 'Pełne uprawnienia do zarządzania systemem' },
    { value: 'DEMO', label: 'Demo', description: 'Ograniczone uprawnienia demonstracyjne' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Aktywny' },
    { value: 'INACTIVE', label: 'Nieaktywny' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Nazwa użytkownika jest wymagana';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Adres email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Nieprawidłowy format adresu email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const newUser = {
        id: Date.now(),
        ...formData,
        createdAt: new Date()?.toISOString(),
        lastLogin: null,
        articleReviews: 0,
        loginCount: 0
      };

      await onAddUser(newUser);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Wystąpił błąd podczas dodawania użytkownika' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      status: 'ACTIVE',
      sendNotification: true
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
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
          <h2 className="text-lg font-semibold text-card-foreground">Dodaj nowego użytkownika</h2>
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
            label="Nazwa użytkownika"
            type="text"
            placeholder="Wprowadź nazwę użytkownika"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />

          <Input
            label="Adres email"
            type="email"
            placeholder="user@example.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <Select
            label="Rola użytkownika"
            options={roleOptions}
            value={formData?.role}
            onChange={(value) => handleInputChange('role', value)}
            description="Wybierz odpowiedni poziom uprawnień"
          />

          <Select
            label="Status konta"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
          />

          <Checkbox
            label="Wyślij powiadomienie email"
            description="Użytkownik otrzyma email z danymi dostępu"
            checked={formData?.sendNotification}
            onChange={(e) => handleInputChange('sendNotification', e?.target?.checked)}
          />

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
              Anuluj
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="UserPlus"
              iconPosition="left"
            >
              Dodaj użytkownika
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;