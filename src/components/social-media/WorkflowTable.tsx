import React, { useState, useMemo } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import DataTable, { Column } from '../ui/DataTable';
import { cn } from '../../utils/cn';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'error' | 'running';
  lastRun?: Date;
  success?: boolean;
  tags?: string[];
  nodes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowTableProps {
  workflows: Workflow[];
  isConnected: boolean;
  onRunWorkflow: (id: string) => void;
  onViewDetails: (workflow: Workflow) => void;
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({
  workflows,
  isConnected,
  onRunWorkflow,
  onViewDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastRun'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'error': return 'Error';
      case 'running': return 'Running...';
      default: return 'Unknown';
    }
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
  };

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.tags?.some(tag => {
          const tagText = typeof tag === 'object' && tag?.name ? tag.name : typeof tag === 'string' ? tag : '';
          return tagText.toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastRun':
          aValue = a.lastRun?.getTime() || 0;
          bValue = b.lastRun?.getTime() || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workflows, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field as 'name' | 'status' | 'lastRun');
    setSortOrder(direction);
  };

  if (workflows.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Workflow" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          No configured N8N workflows
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj workflow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="active">Aktywne</option>
          <option value="paused">Wstrzymane</option>
          <option value="error">Error</option>
          <option value="running">Running</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Workflow Name',
            sortable: true,
            render: (value, row) => (
              <div>
                <div className="font-medium text-sm text-gray-900">
                  {row.name}
                </div>
                {row.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {row.description}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                getWorkflowStatusColor(value)
              )}>
                {getWorkflowStatusText(value)}
              </span>
            )
          },
          {
            key: 'lastRun',
            label: 'Last Run',
            sortable: true,
            render: (value) => (
              <span className="text-sm text-gray-700">
                {formatLastRun(value)}
              </span>
            )
          },
          {
            key: 'tags',
            label: 'Tags',
            render: (value, row) => (
              row.tags && row.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {row.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {typeof tag === 'object' && tag?.name ? tag.name : typeof tag === 'string' ? tag : 'Tag'}
                    </span>
                  ))}
                  {row.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{row.tags.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500">No tags</span>
              )
            )
          },
          {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            render: (_, row) => (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Eye"
                  iconSize={14}
                  onClick={() => onViewDetails(row)}
                  title="View details"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Play"
                  iconSize={14}
                  onClick={() => onRunWorkflow(row.id)}
                  disabled={!isConnected || row.status === 'running'}
                  title={row.status === 'running' ? 'Running...' : 'Run workflow'}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                />
              </div>
            )
          }
        ]}
        data={filteredAndSortedWorkflows}
        keyField="id"
        onSort={handleSort}
        sortField={sortBy}
        sortDirection={sortOrder}
        initialColumnWidths={{
          name: 300,
          status: 120,
          lastRun: 150,
          tags: 200,
          actions: 150
        }}
        storageKey="workflow-table-column-widths"
        emptyMessage="No workflows found"
      />

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedWorkflows.length} of {workflows.length} workflows
      </div>
    </div>
  );
};

export default WorkflowTable;