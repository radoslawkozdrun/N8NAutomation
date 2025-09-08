import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const AddAccountModal = ({ onClose, onAddAccount }) => {
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [credentials, setCredentials] = useState({
    username: '',
    accessToken: '',
    refreshToken: '',
    clientId: '',
    clientSecret: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'Twitter',
      color: 'bg-sky-500',
      description: 'Połącz konto Twitter dla publikacji postów',
      fields: ['username', 'accessToken']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'bg-blue-700',
      description: 'Połącz profil osobisty lub stronę firmową',
      fields: ['username', 'accessToken', 'refreshToken']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Połącz konto Instagram Business',
      fields: ['username', 'accessToken', 'clientId']
    },
    {
      id: 'blog',
      name: 'Blog',
      icon: 'FileText',
      color: 'bg-gray-600',
      description: 'Dodaj blog WordPress lub własny CMS',
      fields: ['username', 'accessToken', 'clientSecret']
    }
  ];

  const fieldLabels = {
    username: 'Nazwa użytkownika',
    accessToken: 'Access Token',
    refreshToken: 'Refresh Token',
    clientId: 'Client ID',
    clientSecret: 'Client Secret'
  };

  const fieldPlaceholders = {
    username: '@nazwauzytkownika lub URL',
    accessToken: 'Wklej access token',
    refreshToken: 'Wklej refresh token (opcjonalnie)',
    clientId: 'Client ID z aplikacji',
    clientSecret: 'Client Secret z aplikacji'
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setStep(2);
    setCredentials({
      username: '',
      accessToken: '',
      refreshToken: '',
      clientId: '',
      clientSecret: ''
    });
  };

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const accountData = {
      platform: selectedPlatform?.id,
      username: credentials?.username,
      displayName: credentials?.username?.replace('@', ''),
      followers: Math.floor(Math.random() * 10000) + 1000,
      permissions: ['read', 'write'],
      postingEnabled: true,
      contentFormatPrefs: {
        hashtags: selectedPlatform?.id !== 'linkedin',
        mentions: true,
        autoThread: selectedPlatform?.id === 'twitter'
      }
    };

    onAddAccount?.(accountData);
    setIsConnecting(false);
  };

  const isFormValid = () => {
    if (!selectedPlatform) return false;
    
    const requiredFields = selectedPlatform?.fields?.slice(0, 2); // First 2 fields are required
    return requiredFields?.every(field => credentials?.[field]?.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Dodaj nowe konto
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Krok {step} z 2: {step === 1 ? 'Wybierz platformę' : 'Podaj dane autoryzacji'}
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
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Wybierz platformę społecznościową, którą chcesz połączyć
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms?.map((platform) => (
                  <button
                    key={platform?.id}
                    onClick={() => handlePlatformSelect(platform)}
                    className={cn(
                      "p-6 border border-border rounded-lg text-left",
                      "hover:border-primary hover:bg-primary/5 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={cn("p-3 rounded-lg", platform?.color)}>
                        <Icon name={platform?.icon} size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-2">
                          {platform?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {platform?.description}
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedPlatform && (
            <div className="space-y-6">
              {/* Platform Header */}
              <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-lg", selectedPlatform?.color)}>
                  <Icon name={selectedPlatform?.icon} size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Połącz z {selectedPlatform?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlatform?.description}
                  </p>
                </div>
              </div>

              {/* Authorization Form */}
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary">
                      <p className="font-medium mb-1">Jak uzyskać dane autoryzacji:</p>
                      <ul className="space-y-1 text-sm">
                        <li>1. Przejdź do ustawień developera na platformie {selectedPlatform?.name}</li>
                        <li>2. Utwórz nową aplikację lub użyj istniejącej</li>
                        <li>3. Skopiuj wymagane tokeny i klucze</li>
                        <li>4. Wklej je w poniższe pola</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {selectedPlatform?.fields?.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {fieldLabels?.[field]}
                      {selectedPlatform?.fields?.indexOf(field) < 2 && (
                        <span className="text-error ml-1">*</span>
                      )}
                    </label>
                    <input
                      type={field?.includes('Token') || field?.includes('Secret') ? 'password' : 'text'}
                      value={credentials?.[field]}
                      onChange={(e) => handleCredentialChange(field, e?.target?.value)}
                      placeholder={fieldPlaceholders?.[field]}
                      className={cn(
                        "w-full px-3 py-2 text-sm border rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                        "placeholder:text-muted-foreground"
                      )}
                    />
                  </div>
                ))}

                {/* Test Connection */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Test połączenia
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sprawdzi poprawność podanych danych
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Zap"
                      disabled={!isFormValid() || isConnecting}
                    >
                      Testuj
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {step === 2 && (
                <Button
                  variant="outline"
                  iconName="ArrowLeft"
                  onClick={() => setStep(1)}
                  disabled={isConnecting}
                >
                  Wstecz
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isConnecting}
              >
                Anuluj
              </Button>
              
              {step === 2 && (
                <Button
                  variant="default"
                  iconName="Link"
                  loading={isConnecting}
                  onClick={handleConnect}
                  disabled={!isFormValid()}
                >
                  {isConnecting ? 'Łączenie...' : 'Połącz konto'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;