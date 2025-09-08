import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const AccountDetailsModal = ({ account, onClose, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    postingEnabled: account?.postingEnabled || false,
    contentFormatPrefs: {
      hashtags: account?.contentFormatPrefs?.hashtags || false,
      mentions: account?.contentFormatPrefs?.mentions || false,
      autoThread: account?.contentFormatPrefs?.autoThread || false
    },
    targetAudience: account?.targetAudience || '',
    maxPostsPerDay: account?.maxPostsPerDay || 5,
    optimalPostingTimes: account?.optimalPostingTimes || []
  });

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: 'Eye' },
    { id: 'settings', label: 'Ustawienia', icon: 'Settings' },
    { id: 'permissions', label: 'Uprawnienia', icon: 'Shield' },
    { id: 'analytics', label: 'Analityka', icon: 'BarChart' }
  ];

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: 'Twitter',
      linkedin: 'Linkedin',
      instagram: 'Instagram',
      blog: 'FileText'
    };
    return icons?.[platform] || 'Globe';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: 'bg-sky-500',
      linkedin: 'bg-blue-700',
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      blog: 'bg-gray-600'
    };
    return colors?.[platform] || 'bg-muted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success bg-success/10';
      case 'error': return 'text-error bg-error/10';
      case 'warning': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleString('pl-PL');
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContentPrefsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      contentFormatPrefs: {
        ...prev?.contentFormatPrefs,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    onUpdateSettings?.(settings);
    onClose?.();
  };

  // Mock analytics data
  const analyticsData = {
    postsThisMonth: 24,
    engagement: '4.2%',
    reach: '15.2K',
    topPost: 'React 18 wprowadza nowości...',
    bestTime: '14:00-16:00'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn("p-3 rounded-lg", getPlatformColor(account?.platform))}>
                <Icon name={getPlatformIcon(account?.platform)} size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {account?.displayName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {account?.username} • {account?.followers?.toLocaleString()} obserwujących
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(account?.status)
                  )}>
                    {account?.status === 'connected' ? 'Połączono' : 
                     account?.status === 'error' ? 'Błąd' : 'Ostrzeżenie'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab?.id
                    ? "border-primary text-primary" :"border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Status połączenia</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ostatnia synchronizacja:</span>
                      <span className="text-foreground">{formatDate(account?.lastSync)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wygaśnięcie autoryzacji:</span>
                      <span className="text-foreground">{formatDate(account?.authExpiresAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stan połączenia:</span>
                      <span className={cn(
                        "capitalize font-medium",
                        account?.connectionHealth === 'healthy' ? 'text-success' :
                        account?.connectionHealth === 'degraded' ? 'text-warning' : 'text-error'
                      )}>
                        {account?.connectionHealth}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Limity API</h3>
                  
                  {account?.apiRateLimit && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Użyte/Limit:</span>
                        <span className="text-foreground">
                          {account?.apiRateLimit?.used}/{account?.apiRateLimit?.limit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reset:</span>
                        <span className="text-foreground">{account?.apiRateLimit?.resetTime || 'N/A'}</span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all",
                            (account?.apiRateLimit?.used / account?.apiRateLimit?.limit) > 0.9 ? 'bg-error' :
                            (account?.apiRateLimit?.used / account?.apiRateLimit?.limit) > 0.7 ? 'bg-warning' : 'bg-success'
                          )}
                          style={{ 
                            width: `${(account?.apiRateLimit?.used / account?.apiRateLimit?.limit) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Messages */}
              {account?.errorMessage && (
                <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-error">Błąd połączenia</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {account?.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {account?.warningMessage && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning">Ostrzeżenie</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {account?.warningMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Publishing Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Ustawienia publikacji</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Włącz publikację</p>
                      <p className="text-sm text-muted-foreground">
                        Pozwala na automatyczną publikację postów na tym koncie
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.postingEnabled}
                        onChange={(e) => handleSettingsChange('postingEnabled', e?.target?.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Maksymalna liczba postów dziennie
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings?.maxPostsPerDay}
                      onChange={(e) => handleSettingsChange('maxPostsPerDay', parseInt(e?.target?.value))}
                      className="w-24 px-3 py-2 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Content Formatting */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Formatowanie treści</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Automatyczne hashtagi</p>
                      <p className="text-sm text-muted-foreground">
                        Dodawaj suggostowane hashtagi do postów
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.contentFormatPrefs?.hashtags}
                        onChange={(e) => handleContentPrefsChange('hashtags', e?.target?.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Oznaczenia użytkowników</p>
                      <p className="text-sm text-muted-foreground">
                        Pozwól na oznaczanie innych użytkowników
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.contentFormatPrefs?.mentions}
                        onChange={(e) => handleContentPrefsChange('mentions', e?.target?.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {account?.platform === 'twitter' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Automatyczne wątki</p>
                        <p className="text-sm text-muted-foreground">
                          Automatycznie dziel długie posty na wątki
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings?.contentFormatPrefs?.autoThread}
                          onChange={(e) => handleContentPrefsChange('autoThread', e?.target?.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Uprawnienia API</h3>
                
                <div className="space-y-3">
                  {account?.permissions?.map((permission) => (
                    <div key={permission} className="flex items-center space-x-3">
                      <Icon name="CheckCircle" size={16} className="text-success" />
                      <span className="text-foreground capitalize">{permission}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Uprawnienia są nadawane podczas procesu autoryzacji OAuth. 
                    Aby zmienić uprawnienia, należy ponownie autoryzować konto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Posty w tym miesiącu</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData?.postsThisMonth}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Średni engagement</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData?.engagement}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Zasięg</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData?.reach}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Najlepiej działający post</h4>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">{analyticsData?.topPost}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Najlepsze godziny publikacji: {analyticsData?.bestTime}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Ostatnia aktualizacja: {formatDate(account?.lastSync)}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Zamknij
              </Button>
              
              {activeTab === 'settings' && (
                <Button
                  variant="default"
                  iconName="Save"
                  onClick={handleSaveSettings}
                >
                  Zapisz ustawienia
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsModal;