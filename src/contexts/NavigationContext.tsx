import React, { createContext, useContext } from 'react';
import { ViewType } from '@/types';

interface NavigationContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({
  children,
  currentView,
  onViewChange
}: {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <NavigationContext.Provider value={{
      currentView,
      setCurrentView: onViewChange
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}