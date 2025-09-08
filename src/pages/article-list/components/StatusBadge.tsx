import React from 'react';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      NEW: {
        label: 'Nowy',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      PENDING_REVIEW: {
        label: 'Oczekuje przeglądu',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      ACCEPTED: {
        label: 'Zaakceptowany',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      REJECTED: {
        label: 'Odrzucony',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      ARCHIVED: {
        label: 'Zarchiwizowany',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      NEEDS_MORE: {
        label: 'Wymaga więcej',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      RESEARCH_DONE: {
        label: 'Badania zakończone',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
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
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${config?.className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;