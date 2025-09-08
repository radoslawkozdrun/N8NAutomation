import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

const PlatformSelector = ({ 
  platforms, 
  selectedPlatform, 
  onPlatformSelect 
}) => {
  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      {platforms?.map((platform) => (
        <button
          key={platform?.id}
          onClick={() => onPlatformSelect?.(platform?.id)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors",
            selectedPlatform === platform?.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Icon name={platform?.icon} size={16} />
          <span className="font-medium">{platform?.name}</span>
          <span className="text-xs opacity-70">
            ({platform?.limits})
          </span>
        </button>
      ))}
    </div>
  );
};

export default PlatformSelector;