import React from 'react';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      NEW: {
        label: 'Nowy',
        className: 'bg-yellow-400 text-yellow-900 border-yellow-500'
      },
      PENDING_REVIEW: {
        label: 'Oczekuje przeglądu',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      ACCEPTED: {
        label: 'Zaakceptowany',
        className: 'bg-green-500 text-white border-green-600'
      },
      REJECTED: {
        label: 'Odrzucony',
        className: 'bg-red-500 text-white border-red-600'
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
    <span className={`inline-flex items-center justify-center rounded-full border font-medium w-32 ${sizeClasses} ${config?.className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;