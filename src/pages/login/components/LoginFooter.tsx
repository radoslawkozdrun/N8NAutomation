import React from 'react';

const LoginFooter = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="mt-8 text-center space-y-4">
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <a
          href="/privacy"
          className="hover:text-primary transition-hover"
        >
          Polityka prywatności
        </a>
        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
        <a
          href="/terms"
          className="hover:text-primary transition-hover"
        >
          Regulamin
        </a>
        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
        <a
          href="/support"
          className="hover:text-primary transition-hover"
        >
          Pomoc
        </a>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>© {currentYear} OPIX. Wszystkie prawa zastrzeżone.</p>
        <p className="mt-1">
          System zarządzania treścią RSS z wykorzystaniem AI
        </p>
      </div>
    </div>
  );
};

export default LoginFooter;