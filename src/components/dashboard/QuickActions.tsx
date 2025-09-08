import React from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';

interface QuickActionsProps {
  onAction?: (action: string) => void;
  userRole?: string;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAction,
  userRole = 'USER',
  className = '' 
}) => {
  const actions = [
    {
      key: 'review_pending',
      label: 'Przejrzyj oczekujące',
      description: 'Sprawdź artykuły wymagające przeglądu',
      icon: 'Eye',
      variant: 'default',
      roles: ['ADMIN', 'USER']
    },
    {
      key: 'bulk_operations',
      label: 'Operacje masowe',
      description: 'Wykonaj działania na wielu artykułach',
      icon: 'Package',
      variant: 'outline',
      roles: ['ADMIN', 'USER']
    },
    {
      key: 'add_feed',
      label: 'Dodaj źródło RSS',
      description: 'Skonfiguruj nowe źródło artykułów',
      icon: 'Plus',
      variant: 'outline',
      roles: ['ADMIN']
    },
    {
      key: 'manage_users',
      label: 'Zarządzaj użytkownikami',
      description: 'Administruj kontami użytkowników',
      icon: 'Users',
      variant: 'outline',
      roles: ['ADMIN']
    },
    {
      key: 'export_data',
      label: 'Eksportuj dane',
      description: 'Pobierz raporty i statystyki',
      icon: 'Download',
      variant: 'ghost',
      roles: ['ADMIN', 'USER']
    },
    {
      key: 'system_settings',
      label: 'Ustawienia systemu',
      description: 'Konfiguruj parametry aplikacji',
      icon: 'Settings',
      variant: 'ghost',
      roles: ['ADMIN']
    }
  ];

  const availableActions = actions.filter(action => 
    action.roles.includes(userRole)
  );

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">
          Szybkie działania
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Najczęściej używane funkcje
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableActions.map((action) => (
            <div
              key={action.key}
              className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-hover cursor-pointer"
              onClick={() => onAction && onAction(action.key)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={action.icon} size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-hover">
                    {action.label}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {userRole === 'DEMO' && (
          <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning">
                  Konto demonstracyjne
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Niektóre funkcje są ograniczone w trybie demo. Skontaktuj się z administratorem, aby uzyskać pełny dostęp.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;