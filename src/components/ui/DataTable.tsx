import React, { ReactNode } from 'react';
import { useResizableColumns } from '../../hooks/useResizableColumns';
import ResizeHandle from './ResizeHandle';
import { cn } from '../../lib/utils';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  emptyMessage?: string;
  initialColumnWidths?: { [key: string]: number };
  storageKey?: string;
  onRowClick?: (row: any) => void;
  minColumnWidth?: number;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  keyField = 'id',
  onSort,
  sortField,
  sortDirection,
  isLoading = false,
  emptyMessage = 'No data available',
  initialColumnWidths,
  storageKey,
  onRowClick,
  minColumnWidth = 80,
  className
}) => {
  // Setup resizable columns if initial widths are provided
  const defaultWidths = initialColumnWidths || columns.reduce((acc, col) => {
    acc[col.key] = 150;
    return acc;
  }, {} as { [key: string]: number });

  const { columnWidths, handleMouseDown, activeColumn } = useResizableColumns({
    initialWidths: defaultWidths,
    minWidth: minColumnWidth,
    storageKey: storageKey || 'datatable-column-widths'
  });

  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return;
    const newDirection = sortField === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortField !== columnKey) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative",
                    column.headerClassName
                  )}
                  style={initialColumnWidths ? { width: columnWidths[column.key] } : undefined}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column)}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors group w-full"
                    >
                      <span>{column.label}</span>
                      <span className="text-gray-400 group-hover:text-gray-600 text-sm">
                        {getSortIcon(column.key)}
                      </span>
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                  {initialColumnWidths && (
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown(e, column.key)}
                      isActive={activeColumn === column.key}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-base font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={`${row[keyField] || rowIndex}-${column.key}`}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm text-gray-700",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
