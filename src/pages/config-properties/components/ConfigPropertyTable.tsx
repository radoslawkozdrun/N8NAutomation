import React from 'react';
import Button from '../../../components/ui/Button';
import DataTable, { Column } from '../../../components/ui/DataTable';
import { ConfigProperty } from '../../../types';
import { cn } from '../../../lib/utils';

interface ConfigPropertyTableProps {
  properties: ConfigProperty[];
  onEdit: (property: ConfigProperty) => void;
  onToggleStatus: (property: ConfigProperty) => void;
  onDelete: (property: ConfigProperty) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

const ConfigPropertyTable: React.FC<ConfigPropertyTableProps> = ({
  properties,
  onEdit,
  onToggleStatus,
  onDelete,
  onSort,
  sortField,
  sortDirection,
}) => {

  const formatValue = (value: string | null, dataType: string, isEncrypted: boolean) => {
    if (isEncrypted && value) {
      return '••••••••';
    }

    if (value === null) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (dataType === 'boolean') {
      return value === 'true' ?
        <span className="text-green-600 font-medium">true</span> :
        <span className="text-red-600 font-medium">false</span>;
    }

    if (dataType === 'json') {
      try {
        JSON.parse(value);
        return (
          <span className="font-mono text-sm">
            {value.length > 50 ? `${value.substring(0, 50)}...` : value}
          </span>
        );
      } catch {
        return <span className="font-mono text-sm text-red-600">{value}</span>;
      }
    }

    return value.length > 50 ? `${value.substring(0, 50)}...` : value;
  };

  const getDataTypeBadge = (dataType: string) => {
    const colors = {
      string: 'bg-blue-100 text-blue-800',
      integer: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800',
      json: 'bg-orange-100 text-orange-800',
      text: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={cn(
        'px-2 py-1 rounded text-xs font-medium',
        colors[dataType as keyof typeof colors] || colors.string
      )}>
        {dataType}
      </span>
    );
  };

  const columns: Column[] = [
    {
      key: 'key',
      label: 'Key',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-medium text-gray-900 truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      render: (value, row) => (
        <div className="text-sm text-gray-700 truncate" title={value || ''}>
          {formatValue(value, row.data_type, row.is_encrypted)}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="text-sm text-gray-500 truncate" title={value || 'No description'}>
          {value || <span className="italic">No description</span>}
        </div>
      )
    },
    {
      key: 'data_type',
      label: 'Type',
      sortable: true,
      render: (value) => getDataTypeBadge(value)
    },
    {
      key: 'is_encrypted',
      label: 'Security',
      render: (value) => value ? (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          🔒 Encrypted
        </span>
      ) : null
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={cn(
          'inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        )}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(value).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            iconName="Edit"
            iconSize={14}
            title="Edit property"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(row)}
            iconName={row.is_active ? "Pause" : "Play"}
            iconSize={14}
            title={row.is_active ? "Deactivate" : "Activate"}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            iconName="Trash2"
            iconSize={14}
            title="Delete property"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={properties}
      keyField="id"
      onSort={(field, direction) => {
        onSort(field);
      }}
      sortField={sortField}
      sortDirection={sortDirection}
      initialColumnWidths={{
        key: 200,
        value: 200,
        description: 250,
        type: 100,
        is_encrypted: 120,
        is_active: 100,
        updated_at: 150,
        actions: 150
      }}
      storageKey="config-properties-column-widths"
      emptyMessage="No configuration properties found"
    />
  );
};

export default ConfigPropertyTable;