import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DemoCredentials = ({ onUseCredentials }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const demoAccounts = [
    {
      role: 'ADMIN',
      email: 'admin',
      password: '1qaz@WSX',
      description: 'Full system access'
    },
    {
      role: 'USER',
      email: 'user@opix.pl',
      password: 'user123',
      description: 'Access to browsing and rating articles (Mock)'
    },
    {
      role: 'DEMO',
      email: 'demo@opix.pl',
      password: 'demo123',
      description: 'Limited demo access (Mock)'
    }
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-error/10 text-error border-error/20';
      case 'USER':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'DEMO':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2"
      >
        <div className="flex items-center space-x-2">
          <Icon name="TestTube" size={16} className="text-primary" />
          <span className="skote-body-text font-medium">Demo Accounts</span>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </Button>
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="skote-small-text text-muted-foreground mb-3">
            Use the following credentials to test the system:
          </p>
          
          {demoAccounts?.map((account, index) => (
            <div
              key={index}
              className="p-3 bg-card rounded-lg border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 skote-small-text font-medium rounded border ${getRoleBadgeColor(account?.role)}`}>
                  {account?.role}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onUseCredentials(account?.email, account?.password)}
                  className="skote-small-text"
                >
                  Use
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={12} className="text-muted-foreground" />
                  <span className="skote-small-text font-mono text-foreground">{account?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Key" size={12} className="text-muted-foreground" />
                  <span className="skote-small-text font-mono text-foreground">{account?.password}</span>
                </div>
                <p className="skote-small-text text-muted-foreground mt-1">
                  {account?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoCredentials;