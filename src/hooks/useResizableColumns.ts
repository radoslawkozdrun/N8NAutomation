import { useState, useEffect, useRef, useCallback } from 'react';

export interface ColumnWidths {
  [key: string]: number;
}

interface UseResizableColumnsProps {
  initialWidths: ColumnWidths;
  minWidth?: number;
  storageKey?: string;
}

export const useResizableColumns = ({
  initialWidths,
  minWidth = 50,
  storageKey
}: UseResizableColumnsProps) => {
  // Load from localStorage if storageKey is provided
  const getInitialWidths = () => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return initialWidths;
        }
      }
    }
    return initialWidths;
  };

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(getInitialWidths);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Save to localStorage when widths change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(columnWidths));
    }
  }, [columnWidths, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setActiveColumn(columnKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[columnKey];
  }, [columnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeColumn) return;

    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, startWidthRef.current + diff);

    setColumnWidths(prev => ({
      ...prev,
      [activeColumn]: newWidth
    }));
  }, [activeColumn, minWidth]);

  const handleMouseUp = useCallback(() => {
    setActiveColumn(null);
  }, []);

  useEffect(() => {
    if (activeColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [activeColumn, handleMouseMove, handleMouseUp]);

  const resetWidths = useCallback(() => {
    setColumnWidths(initialWidths);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [initialWidths, storageKey]);

  return {
    columnWidths,
    handleMouseDown,
    activeColumn,
    resetWidths
  };
};
