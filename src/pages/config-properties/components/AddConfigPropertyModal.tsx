import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

interface AddConfigPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    value: string;
    description: string;
    data_type: string;
    is_encrypted: boolean;
    is_active: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

const AddConfigPropertyModal: React.FC<AddConfigPropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    data_type: 'string',
    is_encrypted: false,
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key jest wymagany';
    } else if (!/^[A-Z0-9_]+$/.test(formData.key.trim())) {
      newErrors.key = 'Key can only contain uppercase letters, numbers and underscores';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Opis jest wymagany';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        key: formData.key.trim().toUpperCase()
      });

      // Reset form on success
      setFormData({
        key: '',
        value: '',
        description: '',
        data_type: 'string',
        is_encrypted: false,
        is_active: true
      });
      setErrors({});
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleClose = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      data_type: 'string',
      is_encrypted: false,
      is_active: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Configuration Property
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a new system configuration property
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klucz *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleChange('key', e.target.value.toUpperCase())}
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                errors.key ? "border-red-300" : "border-gray-300"
              )}
              placeholder="N8N_WORKFLOW_PREFIX"
              disabled={isLoading}
            />
            {errors.key && (
              <p className="text-sm text-red-600 mt-1">{errors.key}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use uppercase letters, numbers and underscores
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type={formData.is_encrypted ? "password" : "text"}
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Property value"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
                errors.description ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Configuration property description"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ danych
            </label>
            <select
              value={formData.data_type}
              onChange={(e) => handleChange('data_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="string">String</option>
              <option value="integer">Integer</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_encrypted}
                onChange={(e) => handleChange('is_encrypted', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Zaszyfrowane</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Aktywne</span>
            </label>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          >
            Add Property
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigPropertyModal;