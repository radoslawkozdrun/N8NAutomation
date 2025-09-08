import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const DecisionPanel = ({ articleId, currentStatus, onDecisionMade }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const actions = [
    {
      id: 'accept',
      label: 'Zaakceptuj',
      icon: 'Check',
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Artykuł zostanie opublikowany'
    },
    {
      id: 'reject',
      label: 'Odrzuć',
      icon: 'X',
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Artykuł zostanie odrzucony'
    },
    {
      id: 'needs_more',
      label: 'Wymaga więcej informacji',
      icon: 'AlertCircle',
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Artykuł wymaga dodatkowych badań'
    }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedAction) {
      error('Wybierz akcję do wykonania');
      return;
    }

    if (!justification?.trim()) {
      error('Uzasadnienie jest wymagane');
      return;
    }

    if (justification?.trim()?.length < 10) {
      error('Uzasadnienie musi mieć co najmniej 10 znaków');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const decision = {
        action: selectedAction,
        justification: justification?.trim(),
        timestamp: new Date()?.toISOString(),
        reviewer: 'Jan Kowalski'
      };

      onDecisionMade(decision);
      success(`Artykuł został ${selectedAction === 'accept' ? 'zaakceptowany' : selectedAction === 'reject' ? 'odrzucony' : 'oznaczony jako wymagający więcej informacji'}`);
      
      // Reset form
      setSelectedAction('');
      setJustification('');
    } catch (err) {
      error('Wystąpił błąd podczas zapisywania decyzji');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusWorkflow = () => {
    const workflows = {
      'NEW': ['PENDING_REVIEW', 'ACCEPTED', 'REJECTED'],
      'PENDING_REVIEW': ['ACCEPTED', 'REJECTED', 'NEEDS_MORE'],
      'NEEDS_MORE': ['RESEARCH_DONE', 'REJECTED'],
      'RESEARCH_DONE': ['ACCEPTED', 'REJECTED'],
      'ACCEPTED': ['ARCHIVED'],
      'REJECTED': ['ARCHIVED']
    };
    return workflows?.[currentStatus] || [];
  };

  const availableTransitions = getStatusWorkflow();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Panel decyzji</h2>
        <div className="flex items-center space-x-2">
          <Icon name="UserCheck" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Recenzent: Jan Kowalski</span>
        </div>
      </div>
      {/* Current Status */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Aktualny status</h3>
            <span className="text-lg font-semibold text-primary">{currentStatus?.replace('_', ' ')}</span>
          </div>
          <Icon name="GitBranch" size={24} className="text-muted-foreground" />
        </div>
      </div>
      {/* Decision Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Action Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Wybierz akcję</h3>
          <div className="grid gap-3">
            {actions?.map((action) => (
              <button
                key={action?.id}
                type="button"
                onClick={() => setSelectedAction(action?.id)}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-smooth ${
                  selectedAction === action?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${action?.color}`}>
                  <Icon name={action?.icon} size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{action?.label}</div>
                  <div className="text-sm text-muted-foreground">{action?.description}</div>
                </div>
                {selectedAction === action?.id && (
                  <Icon name="CheckCircle" size={20} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Justification */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Uzasadnienie decyzji *
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e?.target?.value)}
            placeholder="Opisz powody swojej decyzji. To uzasadnienie zostanie zapisane w historii zmian..."
            className="w-full h-32 p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            required
            minLength={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimum 10 znaków</span>
            <span>{justification?.length}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Decyzja zostanie zapisana w historii zmian
          </div>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!selectedAction || !justification?.trim()}
            className="min-w-32"
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz decyzję'}
          </Button>
        </div>
      </form>
      {/* Available Transitions */}
      {availableTransitions?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Dostępne przejścia</h3>
          <div className="flex flex-wrap gap-2">
            {availableTransitions?.map((status) => (
              <span
                key={status}
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs"
              >
                {status?.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPanel;