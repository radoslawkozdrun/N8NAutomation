import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../contexts/AuthContext';

const DecisionPanel = ({ articleId, currentStatus, onDecisionMade }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const { user } = useAuth();

  const actions = [
    {
      id: 'accept',
      label: 'Accept',
      icon: 'Check',
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Article will be published'
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: 'X',
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Article will be rejected'
    }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedAction) {
      error('Select an action to perform');
      return;
    }

    if (!justification?.trim()) {
      error('Justification is required');
      return;
    }

    if (justification?.trim()?.length < 10) {
      error('Justification must be at least 10 characters');
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
        reviewer: user?.username || 'Unknown User'
      };

      onDecisionMade(decision);
      success(`Article has been ${selectedAction === 'accept' ? 'accepted' : 'rejected'}`);

      // Reset form
      setSelectedAction('');
      setJustification('');
    } catch (err) {
      error('An error occurred while saving the decision');
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
        <h2 className="text-lg font-semibold text-foreground">Decision Panel</h2>
        <div className="flex items-center space-x-2">
          <Icon name="UserCheck" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Reviewer: {user?.username || 'Unknown User'}</span>
        </div>
      </div>
      {/* Current Status */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Current Status</h3>
            <span className="text-lg font-semibold text-primary">{currentStatus?.replace('_', ' ')}</span>
          </div>
          <Icon name="GitBranch" size={24} className="text-muted-foreground" />
        </div>
      </div>
      {/* Decision Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Action Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Select Action</h3>
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
            Decision Justification *
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e?.target?.value)}
            placeholder="Describe the reasons for your decision. This justification will be saved in the change history..."
            className="w-full h-32 p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            required
            minLength={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimum 10 characters</span>
            <span>{justification?.length}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Decision will be saved in change history
          </div>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!selectedAction || !justification?.trim()}
            className="min-w-32"
          >
            {isSubmitting ? 'Saving...' : 'Save Decision'}
          </Button>
        </div>
      </form>
      {/* Available Transitions */}
      {availableTransitions?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Available Transitions</h3>
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