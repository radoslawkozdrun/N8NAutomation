import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryBadge = ({ category, size = 'default' }) => {
  const getCategoryConfig = (category) => {
    const configs = {
      AI_ML: {
        label: 'AI/ML',
        icon: 'Brain',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      WEB_DEV: {
        label: 'Web Dev',
        icon: 'Globe',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      MOBILE_DEV: {
        label: 'Mobile',
        icon: 'Smartphone',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      DATA_SCIENCE: {
        label: 'Data Science',
        icon: 'BarChart3',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      },
      DEVOPS: {
        label: 'DevOps',
        icon: 'Settings',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      SECURITY: {
        label: 'Security',
        icon: 'Shield',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      CLOUD: {
        label: 'Cloud',
        icon: 'Cloud',
        className: 'bg-cyan-100 text-cyan-800 border-cyan-200'
      },
      BLOCKCHAIN: {
        label: 'Blockchain',
        icon: 'Link',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      IOT: {
        label: 'IoT',
        icon: 'Wifi',
        className: 'bg-teal-100 text-teal-800 border-teal-200'
      },
      OTHER: {
        label: 'Inne',
        icon: 'Tag',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };

    return configs?.[category] || {
      label: category,
      icon: 'Tag',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  const config = getCategoryConfig(category);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${sizeClasses} ${config?.className}`}>
      <Icon name={config?.icon} size={iconSize} />
      <span>{config?.label}</span>
    </span>
  );
};

export default CategoryBadge;