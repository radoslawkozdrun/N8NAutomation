import React from 'react';
import { cn } from '../../lib/utils';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown, isActive }) => {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize group",
        "hover:bg-primary/50 transition-colors",
        isActive && "bg-primary"
      )}
      onMouseDown={onMouseDown}
    >
      <div className="absolute right-0 top-0 h-full w-4 -translate-x-1/2" />
    </div>
  );
};

export default ResizeHandle;
