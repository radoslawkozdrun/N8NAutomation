import React from 'react';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      NEW: {
        label: 'New',
        className: 'bg-yellow-400 text-yellow-900 border-yellow-500'
      },
      PENDING_REVIEW: {
        label: 'Pending Review',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      ACCEPTED: {
        label: 'Accepted',
        className: 'bg-green-500 text-white border-green-600'
      },
      REJECTED: {
        label: 'Rejected',
        className: 'bg-red-500 text-white border-red-600'
      },
      ARCHIVED: {
        label: 'Archived',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      NEEDS_MORE: {
        label: 'Needs More',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      RESEARCH_DONE: {
        label: 'Research Done',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      SUMMARY_PREPARED: {
        label: 'Summary Prepared',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    };

    return configs?.[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center justify-center rounded-full border font-medium min-w-32 max-w-fit whitespace-nowrap ${sizeClasses} ${config?.className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;