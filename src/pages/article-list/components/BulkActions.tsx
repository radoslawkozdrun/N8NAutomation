import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection,
  isProcessing = false 
}) => {
  const [selectedAction, setSelectedAction] = useState('');

  const actionOptions = [
    { value: '', label: 'Select action...' },
    { value: 'accept', label: 'Accept selected' },
    { value: 'reject', label: 'Reject selected' },
    { value: 'archive', label: 'Archive selected' },
    { value: 'needs_more', label: 'Needs more information' },
    { value: 'research_done', label: 'Mark as researched' },
    { value: 'delete', label: 'Delete selected', className: 'text-red-600' }
  ];

  const handleExecuteAction = () => {
    if (selectedAction && selectedCount > 0) {
      onBulkAction(selectedAction);
      setSelectedAction('');
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              Selected {selectedCount} {selectedCount === 1 ? 'article' : 'articles'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Select action..."
              className="min-w-48"
            />
            
            <Button
              variant="default"
              onClick={handleExecuteAction}
              disabled={!selectedAction || isProcessing}
              loading={isProcessing}
              iconName="Play"
              iconPosition="left"
            >
              Wykonaj
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
          className="text-muted-foreground"
        >
          Clear Selection
        </Button>
      </div>

      {/* Action Descriptions */}
      {selectedAction && (
        <div className="mt-3 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="text-sm">
              {selectedAction === 'accept' && (
                <p className="text-foreground">
                  <strong>Accept:</strong> Articles will be marked as accepted and ready for publication.
                </p>
              )}
              {selectedAction === 'reject' && (
                <p className="text-foreground">
                  <strong>Reject:</strong> Articles will be marked as rejected and will not be published.
                </p>
              )}
              {selectedAction === 'archive' && (
                <p className="text-foreground">
                  <strong>Archive:</strong> Articles will be moved to archive.
                </p>
              )}
              {selectedAction === 'needs_more' && (
                <p className="text-foreground">
                  <strong>Needs more:</strong> Articles will be marked as requiring additional information.
                </p>
              )}
              {selectedAction === 'research_done' && (
                <p className="text-foreground">
                  <strong>Research Done:</strong> Articles will be marked as researched.
                </p>
              )}
              {selectedAction === 'delete' && (
                <p className="text-red-600">
                  <strong>Delete:</strong> Articles will be permanently deleted from the database. This operation is irreversible!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;