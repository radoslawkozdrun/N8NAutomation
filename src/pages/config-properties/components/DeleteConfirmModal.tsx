import React from 'react';
import Button from '../../../components/ui/Button';

interface ConfigProperty {
  id: number;
  key: string;
  value: string;
  description: string;
  data_type: string;
  is_encrypted: boolean;
  is_active: boolean;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  configProperty: ConfigProperty | null;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  configProperty,
  isLoading = false
}) => {
  if (!isOpen || !configProperty) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Configuration Property
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete this property?
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Klucz:</span>
                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs">
                  {configProperty.key}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Opis:</span>
                <span className="text-gray-900 max-w-xs truncate">
                  {configProperty.description}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Typ:</span>
                <span className="text-gray-900">{configProperty.data_type}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  configProperty.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {configProperty.is_active ? 'Aktywne' : 'Nieaktywne'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Uwaga:</strong> Ta operacja jest nieodwracalna.
                  Deleting a configuration property may affect system operation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            Delete Property
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;