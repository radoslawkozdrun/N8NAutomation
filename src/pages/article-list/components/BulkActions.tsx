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
    { value: '', label: 'Wybierz akcję...' },
    { value: 'accept', label: 'Zaakceptuj wybrane' },
    { value: 'reject', label: 'Odrzuć wybrane' },
    { value: 'archive', label: 'Zarchiwizuj wybrane' },
    { value: 'needs_more', label: 'Wymaga więcej informacji' },
    { value: 'research_done', label: 'Oznacz jako zbadane' }
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
              Wybrano {selectedCount} {selectedCount === 1 ? 'artykuł' : 'artykułów'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Wybierz akcję..."
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
          Wyczyść zaznaczenie
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
                  <strong>Zaakceptuj:</strong> Artykuły zostaną oznaczone jako zaakceptowane i będą gotowe do publikacji.
                </p>
              )}
              {selectedAction === 'reject' && (
                <p className="text-foreground">
                  <strong>Odrzuć:</strong> Artykuły zostaną oznaczone jako odrzucone i nie będą publikowane.
                </p>
              )}
              {selectedAction === 'archive' && (
                <p className="text-foreground">
                  <strong>Zarchiwizuj:</strong> Artykuły zostaną przeniesione do archiwum.
                </p>
              )}
              {selectedAction === 'needs_more' && (
                <p className="text-foreground">
                  <strong>Wymaga więcej:</strong> Artykuły zostaną oznaczone jako wymagające dodatkowych informacji.
                </p>
              )}
              {selectedAction === 'research_done' && (
                <p className="text-foreground">
                  <strong>Badania zakończone:</strong> Artykuły zostaną oznaczone jako przebadane.
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