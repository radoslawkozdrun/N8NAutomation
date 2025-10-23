import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

interface ConfigProperty {
  id: number;
  key: string;
  value: string;
  description: string;
  data_type: string;
  is_encrypted: boolean;
  is_active: boolean;
}

interface EditConfigPropertyModalProps {
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
  configProperty: ConfigProperty | null;
  isLoading?: boolean;
}

const EditConfigPropertyModal: React.FC<EditConfigPropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  configProperty,
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
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    if (configProperty && isOpen) {
      setFormData({
        key: configProperty.key || '',
        value: configProperty.value || '',
        description: configProperty.description || '',
        data_type: configProperty.data_type || 'string',
        is_encrypted: configProperty.is_encrypted || false,
        is_active: configProperty.is_active !== undefined ? configProperty.is_active : true
      });
      setShowValue(false);
    }
  }, [configProperty, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.key.trim())) {
      newErrors.key = 'Key can only contain uppercase letters, numbers and underscores';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    console.log('Form validation:', { formData, errors: newErrors, isValid: Object.keys(newErrors).length === 0 });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Edit form submitted', { formData, configProperty });
    e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      console.log('Calling onSubmit with data:', formData);
      await onSubmit({
        ...formData,
        key: formData.key.trim().toUpperCase()
      });
      console.log('onSubmit completed successfully');
      setErrors({});
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
    setShowValue(false);
    onClose();
  };

  if (!isOpen || !configProperty) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Configuration Property
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Modify property: <span className="font-mono bg-gray-100 px-1 rounded">{configProperty.key}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key *
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
            <div className="relative">
              <input
                type={formData.is_encrypted && !showValue ? "password" : "text"}
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Property value"
                disabled={isLoading}
              />
              {formData.is_encrypted && (
                <button
                  type="button"
                  onClick={() => setShowValue(!showValue)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showValue ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
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
              Data Type
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
              <span className="ml-2 text-sm text-gray-700">Encrypted</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditConfigPropertyModal;