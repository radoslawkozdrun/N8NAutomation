import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'error' | 'running';
  lastRun?: Date;
  success?: boolean;
  tags?: string[];
  nodes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowDetailsModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflow: (id: string) => void;
  isConnected: boolean;
}

const WorkflowDetailsModal: React.FC<WorkflowDetailsModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onRunWorkflow,
  isConnected
}) => {
  if (!isOpen || !workflow) return null;

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 border-green-200';
      case 'paused': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'running': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getWorkflowStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny';
      case 'paused': return 'Wstrzymany';
      case 'error': return 'Error';
      case 'running': return 'Running...';
      default: return 'Nieznany';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date format';
    }
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Nigdy';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Workflow Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Informacje o workflow N8N
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Podstawowe informacje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {workflow.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
                  {workflow.id}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opis
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {workflow.description || 'Brak opisu'}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Execution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status i wykonywanie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                  getWorkflowStatusColor(workflow.status)
                )}>
                  {getWorkflowStatusText(workflow.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ostatnie uruchomienie
                </label>
                <p className="text-sm text-gray-900">
                  {formatLastRun(workflow.lastRun)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ostatni wynik
                </label>
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                  workflow.success
                    ? "text-green-700 bg-green-50"
                    : "text-red-700 bg-red-50"
                )}>
                  {workflow.success ? 'Success' : 'Error'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Count
                </label>
                <p className="text-sm text-gray-900">
                  {workflow.nodes || 'No data'} nodes
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {workflow.tags && workflow.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tagi</h3>
              <div className="flex flex-wrap gap-2">
                {workflow.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                  >
                    {typeof tag === 'object' && tag?.name ? tag.name : typeof tag === 'string' ? tag : 'Tag'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data utworzenia
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(workflow.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ostatnia modyfikacja
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(workflow.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Zamknij
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              iconName="ExternalLink"
              onClick={() => {
                // Open N8N workflow in new tab (if URL available)
                console.log('Open in N8N editor:', workflow.id);
              }}
            >
              Open in N8N
            </Button>

            <Button
              iconName="Play"
              loading={workflow.status === 'running'}
              onClick={() => onRunWorkflow(workflow.id)}
              disabled={!isConnected || workflow.status === 'running'}
            >
              {workflow.status === 'running' ? 'Running...' : 'Run Workflow'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailsModal;