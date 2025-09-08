import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ErrorLogModal = ({ isOpen, onClose, feedId, feedName }) => {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [errorTypeFilter, setErrorTypeFilter] = useState('');

  // Mock error log data
  const errorLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'connection_timeout',
      message: 'Przekroczono limit czasu połączenia',
      details: 'Timeout po 30 sekundach podczas próby połączenia z serwerem RSS',
      severity: 'warning',
      resolved: false
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'invalid_xml',
      message: 'Nieprawidłowy format XML',
      details: 'Błąd parsowania XML w linii 45: nieoczekiwany znak',
      severity: 'error',
      resolved: true
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'http_error',
      message: 'Błąd HTTP 404',
      details: 'Zasób nie został znaleziony na serwerze',
      severity: 'error',
      resolved: false
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      type: 'ssl_error',
      message: 'Błąd certyfikatu SSL',
      details: 'Certyfikat SSL wygasł lub jest nieprawidłowy',
      severity: 'critical',
      resolved: true
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      type: 'rate_limit',
      message: 'Przekroczono limit żądań',
      details: 'Serwer zwrócił błąd 429 - zbyt wiele żądań',
      severity: 'warning',
      resolved: true
    }
  ];

  const timeFilterOptions = [
    { value: '1h', label: 'Ostatnia godzina' },
    { value: '24h', label: 'Ostatnie 24 godziny' },
    { value: '7d', label: 'Ostatnie 7 dni' },
    { value: '30d', label: 'Ostatnie 30 dni' },
    { value: 'all', label: 'Wszystkie' }
  ];

  const errorTypeOptions = [
    { value: '', label: 'Wszystkie typy błędów' },
    { value: 'connection_timeout', label: 'Timeout połączenia' },
    { value: 'invalid_xml', label: 'Nieprawidłowy XML' },
    { value: 'http_error', label: 'Błąd HTTP' },
    { value: 'ssl_error', label: 'Błąd SSL' },
    { value: 'rate_limit', label: 'Limit żądań' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-error bg-error/10 border-error/20';
      case 'error':
        return 'text-error bg-error/10 border-error/20';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertCircle';
      default:
        return 'Info';
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} godz. temu`;
    } else {
      return `${minutes} min. temu`;
    }
  };

  const filteredLogs = errorLogs?.filter(log => {
    if (errorTypeFilter && log?.type !== errorTypeFilter) return false;
    
    const now = new Date();
    const logTime = log?.timestamp;
    
    switch (timeFilter) {
      case '1h':
        return (now - logTime) <= (1000 * 60 * 60);
      case '24h':
        return (now - logTime) <= (1000 * 60 * 60 * 24);
      case '7d':
        return (now - logTime) <= (1000 * 60 * 60 * 24 * 7);
      case '30d':
        return (now - logTime) <= (1000 * 60 * 60 * 24 * 30);
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Dziennik błędów</h2>
            <p className="text-sm text-muted-foreground mt-1">{feedName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              placeholder="Okres czasu"
              options={timeFilterOptions}
              value={timeFilter}
              onChange={setTimeFilter}
              className="sm:w-48"
            />
            <Select
              placeholder="Typ błędu"
              options={errorTypeOptions}
              value={errorTypeFilter}
              onChange={setErrorTypeFilter}
              className="sm:w-48"
            />
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Filter" size={16} />
              <span>Znaleziono: {filteredLogs?.length} błędów</span>
            </div>
          </div>
        </div>

        {/* Error Logs */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredLogs?.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredLogs?.map((log) => (
                <div key={log?.id} className="p-6 hover:bg-muted/30 transition-hover">
                  <div className="flex items-start space-x-4">
                    {/* Severity Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(log?.severity)?.replace('text-', 'bg-')?.replace('bg-', 'bg-')?.replace('/10', '/20')}`}>
                      <Icon 
                        name={getSeverityIcon(log?.severity)} 
                        size={16} 
                        className={getSeverityColor(log?.severity)?.split(' ')?.[0]} 
                      />
                    </div>

                    {/* Error Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-foreground">{log?.message}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log?.severity)}`}>
                            {log?.severity === 'critical' ? 'Krytyczny' : 
                             log?.severity === 'error' ? 'Błąd' : 
                             log?.severity === 'warning' ? 'Ostrzeżenie' : 'Info'}
                          </span>
                        </div>
                        {log?.resolved && (
                          <div className="flex items-center space-x-1 text-success text-xs">
                            <Icon name="CheckCircle" size={12} />
                            <span>Rozwiązano</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{log?.details}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(log?.timestamp)}</span>
                        <span>{getRelativeTime(log?.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="CheckCircle" size={48} className="text-success mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Brak błędów</h3>
              <p className="text-sm text-muted-foreground text-center">
                Nie znaleziono błędów dla wybranych kryteriów filtrowania.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-error" />
              <span>Krytyczne: {filteredLogs?.filter(log => log?.severity === 'critical')?.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span>Ostrzeżenia: {filteredLogs?.filter(log => log?.severity === 'warning')?.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Rozwiązane: {filteredLogs?.filter(log => log?.resolved)?.length}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
              Eksportuj dziennik
            </Button>
            <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
              Odśwież
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogModal;