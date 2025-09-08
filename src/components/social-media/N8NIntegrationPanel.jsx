import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const N8NIntegrationPanel = ({ 
  workflows, 
  isConnected, 
  onRunWorkflow 
}) => {
  const getWorkflowStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'paused': return 'text-warning bg-warning/10';
      case 'error': return 'text-error bg-error/10';
      case 'running': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getWorkflowStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktywny';
      case 'paused': return 'Wstrzymany';
      case 'error': return 'Błąd';
      case 'running': return 'Działa...';
      default: return 'Nieznany';
    }
  };

  const formatLastRun = (date) => {
    if (!date) return 'Nigdy';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
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
              <h3 className="text-lg font-semibold text-foreground">
                Integracja N8N
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatyczny import kont przez workflow N8N
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium",
              isConnected 
                ? "bg-success/10 text-success" :"bg-error/10 text-error"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-success" : "bg-error"
              )}></div>
              <span>{isConnected ? 'Połączono' : 'Rozłączono'}</span>
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
                Brak połączenia z N8N
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sprawdź konfigurację N8N i URL endpointu API
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
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
            Dostępne workflow ({workflows?.length || 0})
          </h4>
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            disabled={!isConnected}
          >
            Odśwież
          </Button>
        </div>

        {workflows?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Workflow" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Brak skonfigurowanych workflow N8N
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows?.map((workflow) => (
              <div
                key={workflow?.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h5 className="font-medium text-foreground">
                        {workflow?.name}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {workflow?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getWorkflowStatusColor(workflow?.status)
                    )}>
                      {getWorkflowStatusText(workflow?.status)}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="xs"
                      iconName="Play"
                      loading={workflow?.status === 'running'}
                      onClick={() => onRunWorkflow?.(workflow?.id)}
                      disabled={!isConnected || workflow?.status === 'running'}
                    >
                      {workflow?.status === 'running' ? 'Działa...' : 'Uruchom'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ostatni start:</span>
                    <div className="font-medium">
                      {formatLastRun(workflow?.lastRun)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className={cn(
                      "font-medium",
                      workflow?.success ? "text-success" : "text-error"
                    )}>
                      {workflow?.success ? 'Pomyślnie' : 'Błąd'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Konta:</span>
                    <div className="font-medium">
                      +{workflow?.accountsImported} zaimportowanych
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {workflow?.errorMessage && (
                  <div className="mt-3 p-3 bg-error/5 border border-error/20 rounded text-sm text-error">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{workflow?.errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* N8N Statistics */}
        {workflows?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {workflows?.filter(w => w?.status === 'active')?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktywne workflow
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {workflows?.reduce((sum, w) => sum + (w?.accountsImported || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Kont zaimportowanych
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {workflows?.filter(w => w?.success)?.length || 0}/{workflows?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Wskaźnik sukcesu
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default N8NIntegrationPanel;