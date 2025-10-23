import React from 'react';
import Icon from '../../../components/AppIcon';

const PriorityBadge = ({ priority, size = 'default' }) => {
  const getPriorityConfig = (priority) => {
    const configs = {
      P0_BREAKING: {
        label: 'P0 - Breaking',
        icon: 'AlertTriangle',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      P1_TRENDING: {
        label: 'P1 - Trending',
        icon: 'TrendingUp',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      P2_TIMELY: {
        label: 'P2 - Timely',
        icon: 'Clock',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      P3_EVERGREEN: {
        label: 'P3 - Evergreen',
        icon: 'TreePine',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      P4_FILLER: {
        label: 'P4 - Filler',
        icon: 'Minus',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };

    return configs?.[priority] || {
      label: priority,
      icon: 'Minus',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  const config = getPriorityConfig(priority);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${sizeClasses} ${config?.className}`}>
      <Icon name={config?.icon} size={iconSize} />
      <span>{config?.label}</span>
    </span>
  );
};

export default PriorityBadge;