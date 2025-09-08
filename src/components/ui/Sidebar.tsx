import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export default function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn("w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col", className)}>
      {children}
    </div>
  );
}