import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import N8NConfigModal from '../N8NConfigModal';
import WorkflowTable from './WorkflowTable';
import WorkflowDetailsModal from './WorkflowDetailsModal';

const N8NIntegrationPanel = ({
  workflows,
  isConnected,
  isLoading = false,
  onRunWorkflow,
  onRefresh,
  onConfigChanged
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedWorkflow(null);
    setShowDetailsModal(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Panel Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              isConnected ? "bg-success" : "bg-error"
            )}>
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="skote-card-title text-foreground">
                N8N Integration
              </h3>
              <p className="skote-body-text text-muted-foreground">
                Automatic account import via N8N workflows
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full skote-body-text font-medium",
              isConnected 
                ? "bg-success/10 text-success" :"bg-error/10 text-error"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-success" : "bg-error"
              )}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-6 bg-error/5 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-error" />
            <div>
              <p className="font-medium text-error">
                No connection to N8N
              </p>
              <p className="skote-body-text text-muted-foreground mt-1">
                Check N8N configuration and API endpoint URL
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              onClick={() => setShowConfigModal(true)}
            >
              Konfiguruj
            </Button>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">
            Available Workflows ({workflows?.length || 0})
          </h4>
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            disabled={!isConnected || isLoading}
            onClick={onRefresh}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Icon name="RefreshCw" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">
              Loading workflows from n8n...
            </p>
          </div>
        ) : (
          <WorkflowTable
            workflows={workflows || []}
            isConnected={isConnected}
            onRunWorkflow={onRunWorkflow}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* N8N Statistics */}
        {workflows?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="skote-section-title font-bold text-foreground">
                  {workflows?.filter(w => w?.status === 'active')?.length || 0}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Active workflows
                </div>
              </div>
              <div>
                <div className="skote-section-title font-bold text-foreground">
                  {workflows?.reduce((sum, w) => sum + (w?.accountsImported || 0), 0)}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Accounts imported
                </div>
              </div>
              <div>
                <div className="skote-section-title font-bold text-foreground">
                  {workflows?.filter(w => w?.success)?.length || 0}/{workflows?.length || 0}
                </div>
                <div className="skote-body-text text-muted-foreground">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <N8NConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={() => {
          setShowConfigModal(false);
          if (onConfigChanged) {
            onConfigChanged();
          }
        }}
      />

      <WorkflowDetailsModal
        workflow={selectedWorkflow}
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        onRunWorkflow={onRunWorkflow}
        isConnected={isConnected}
      />
    </div>
  );
};

export default N8NIntegrationPanel;