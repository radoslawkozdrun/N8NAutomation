import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const SchedulingModal = ({ 
  platform, 
  postContent, 
  onClose, 
  onPublish 
}) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isImmediate, setIsImmediate] = useState(true);

  // Mock social media accounts
  const [accounts] = useState([
    {
      id: '1',
      platform: 'twitter',
      username: '@TechBlogPL',
      name: 'Tech Blog Polska',
      status: 'connected',
      followers: 15200,
      lastSync: new Date()
    },
    {
      id: '2', 
      platform: 'twitter',
      username: '@DevNewsPoland',
      name: 'Dev News Poland',
      status: 'connected',
      followers: 8500,
      lastSync: new Date()
    },
    {
      id: '3',
      platform: 'linkedin',
      username: 'Tech Blog Polska',
      name: 'Tech Blog Polska - LinkedIn',
      status: 'connected',
      followers: 3200,
      lastSync: new Date()
    },
    {
      id: '4',
      platform: 'linkedin',
      username: 'Anna Kowalska',
      name: 'Anna Kowalska - Personal',
      status: 'connected',
      followers: 1850,
      lastSync: new Date()
    },
    {
      id: '5',
      platform: 'instagram',
      username: '@techblogpl',
      name: 'Tech Blog PL Instagram',
      status: 'error',
      followers: 4200,
      lastSync: new Date(Date.now() - 86400000) // 1 day ago
    }
  ]);

  const availableAccounts = accounts?.filter(acc => acc?.platform === platform);

  useEffect(() => {
    if (availableAccounts?.length > 0) {
      setSelectedAccount(availableAccounts?.[0]?.id);
    }
  }, [platform]);

  const handlePublish = () => {
    if (!selectedAccount) return;

    const publishTime = isImmediate 
      ? null 
      : new Date(`${scheduledDate} ${scheduledTime}`);

    onPublish?.(selectedAccount, publishTime);
  };

  const getMinDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow?.setDate(now?.getDate() + 1);
    return tomorrow?.toISOString()?.slice(0, 16);
  };

  const getAccountStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getAccountStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'CheckCircle';
      case 'error': return 'XCircle';
      case 'warning': return 'AlertTriangle';
      default: return 'Circle';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Publikacja posta
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Wybierz konto i zaplanuj publikację dla platformy {platform}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Account Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">
              Wybierz konto {platform}
            </h3>
            
            {availableAccounts?.length === 0 ? (
              <div className="text-center p-6 bg-muted/20 rounded-lg">
                <Icon name="AlertCircle" size={24} className="mx-auto mb-2 text-warning" />
                <p className="text-sm text-muted-foreground">
                  Brak połączonych kont dla platformy {platform}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  iconName="Plus"
                >
                  Dodaj konto
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableAccounts?.map((account) => (
                  <div
                    key={account?.id}
                    onClick={() => account?.status === 'connected' && setSelectedAccount(account?.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedAccount === account?.id 
                        ? "border-primary bg-primary/5" :"border-border hover:border-muted-foreground",
                      account?.status !== 'connected' && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={selectedAccount === account?.id}
                            onChange={() => account?.status === 'connected' && setSelectedAccount(account?.id)}
                            disabled={account?.status !== 'connected'}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              {account?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {account?.username} • {account?.followers?.toLocaleString()} obserwujących
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getAccountStatusIcon(account?.status)} 
                          size={16} 
                          className={getAccountStatusColor(account?.status)} 
                        />
                        <span className={cn(
                          "text-xs capitalize",
                          getAccountStatusColor(account?.status)
                        )}>
                          {account?.status === 'connected' ? 'Połączono' : 
                           account?.status === 'error' ? 'Błąd' : 'Ostrzeżenie'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">
              Harmonogram publikacji
            </h3>
            
            <div className="space-y-3">
              {/* Immediate Publishing */}
              <div
                onClick={() => setIsImmediate(true)}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  isImmediate 
                    ? "border-primary bg-primary/5" :"border-border hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={isImmediate}
                    onChange={() => setIsImmediate(true)}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-foreground">
                      Opublikuj natychmiast
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Post zostanie opublikowany od razu po kliknięciu
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Publishing */}
              <div
                onClick={() => setIsImmediate(false)}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  !isImmediate 
                    ? "border-primary bg-primary/5" :"border-border hover:border-muted-foreground"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={!isImmediate}
                      onChange={() => setIsImmediate(false)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-foreground">
                        Zaplanuj publikację
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ustaw datę i godzinę publikacji
                      </div>
                    </div>
                  </div>
                  
                  {!isImmediate && (
                    <div className="ml-6 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e?.target?.value)}
                          min={new Date()?.toISOString()?.split('T')?.[0]}
                          className="w-full px-3 py-2 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Godzina
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e?.target?.value)}
                          className="w-full px-3 py-2 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Preview */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">
              Podgląd posta
            </h3>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="text-sm text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                {postContent}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {!isImmediate && scheduledDate && scheduledTime && (
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={12} />
                  <span>
                    Publikacja: {new Date(`${scheduledDate} ${scheduledTime}`)?.toLocaleString('pl-PL')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Anuluj
              </Button>
              <Button
                variant="default"
                iconName={isImmediate ? "Send" : "Calendar"}
                onClick={handlePublish}
                disabled={!selectedAccount || (!isImmediate && (!scheduledDate || !scheduledTime))}
              >
                {isImmediate ? 'Opublikuj' : 'Zaplanuj'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingModal;