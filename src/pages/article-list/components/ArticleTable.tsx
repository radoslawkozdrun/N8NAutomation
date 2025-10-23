import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DataTable, { Column } from '../../../components/ui/DataTable';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import ArticleInsights from './ArticleInsights';

const ArticleTable = ({
  articles,
  selectedArticles,
  onSelectionChange,
  onSelectAll,
  onQuickAction,
  onViewDetails,
  sortConfig,
  onSort,
  expandedRows,
  onToggleExpand,
  isLoading
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="large" text="Loading articles..." className="h-64" />
      </div>
    );
  }

  const columns: Column[] = [
    {
      key: 'checkbox',
      label: '',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedArticles?.includes(row?.id)}
          onChange={(e) => onSelectionChange(row?.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      key: 'title',
      label: 'Article',
      sortable: true,
      render: (value, row) => (
        <div className="max-w-md">
          <div className="text-sm font-medium text-gray-900 truncate" title={row?.title}>
            {row?.title}
          </div>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Icon name="User" size={12} />
            <span>{row?.author}</span>
            <span className="text-gray-300">•</span>
            <Icon name="Globe" size={12} />
            <span>{row?.source}</span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => <CategoryBadge category={value} />
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => <PriorityBadge priority={value} />
    },
    {
      key: 'final_score',
      label: 'AI Score',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 mr-2">
            {Math.round(row?.aiScores?.final || value || 0)}
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(row?.aiScores?.final || value || 0)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'created_date',
      label: 'Date',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(value || row?.publishedAt)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(row?.id);
            }}
            iconName="Eye"
            iconSize={14}
            title="View details"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction(row?.id, 'accept');
            }}
            iconName="CheckCircle"
            iconSize={14}
            title="Accept"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction(row?.id, 'reject');
            }}
            iconName="XCircle"
            iconSize={14}
            title="Reject"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Skote-style Desktop Table */}
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={articles}
          keyField="id"
          onSort={(field, direction) => {
            onSort({ field, direction });
          }}
          sortField={sortConfig?.field}
          sortDirection={sortConfig?.direction}
          initialColumnWidths={{
            checkbox: 60,
            title: 350,
            category: 150,
            priority: 120,
            final_score: 140,
            status: 130,
            created_date: 150,
            actions: 150
          }}
          storageKey="article-table-column-widths"
          emptyMessage="No articles found. Try adjusting your filters or search terms."
        />
      </div>

      {/* Skote-style Mobile Card Layout */}
      <div className="lg:hidden space-y-4">
        {articles?.map((article) => (
          <div
            key={article?.id}
            className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3 ${
              selectedArticles?.includes(article?.id) ? 'ring-2 ring-blue-500 border-blue-300' : ''
            }`}
          >
            {/* Mobile Card Header */}
            <div className="flex items-start justify-between">
              <input
                type="checkbox"
                checked={selectedArticles?.includes(article?.id)}
                onChange={(e) => onSelectionChange(article?.id, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetails(article?.id)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                >
                  <Icon name="Eye" size={16} />
                </button>
                <button
                  onClick={() => onQuickAction(article?.id, 'accept')}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200"
                >
                  <Icon name="CheckCircle" size={16} />
                </button>
                <button
                  onClick={() => onQuickAction(article?.id, 'reject')}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                >
                  <Icon name="XCircle" size={16} />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">
                {article?.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Icon name="User" size={12} />
                <span>{article?.author}</span>
                <span className="text-slate-300">•</span>
                <Icon name="Globe" size={12} />
                <span>{article?.source}</span>
              </div>
            </div>

            {/* Badges and Score */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <CategoryBadge category={article?.category} />
                <PriorityBadge priority={article?.priority} />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {Math.round(article?.aiScores?.final || 0)}
                  </div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
                <StatusBadge status={article?.status} />
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              {formatDate(article?.created_date || article?.publishedAt)}
            </div>

            {/* Expanded Content */}
            {expandedRows?.includes(article?.id) && (
              <div className="pt-4 border-t border-slate-200">
                <ArticleInsights article={article} />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ArticleTable;