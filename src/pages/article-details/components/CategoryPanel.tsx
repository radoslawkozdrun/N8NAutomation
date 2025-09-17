import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryPanel = ({ category, subcategory, priority, targetAudience, confidence }) => {
  const getCategoryIcon = (cat) => {
    const icons = {
      'AI_ML': 'Brain',
      'WEB_DEV': 'Globe',
      'MOBILE_DEV': 'Smartphone',
      'DATA_SCIENCE': 'BarChart3',
      'DEVOPS': 'Settings',
      'SECURITY': 'Shield',
      'CLOUD': 'Cloud',
      'BLOCKCHAIN': 'Link',
      'IOT': 'Wifi',
      'OTHER': 'Package'
    };
    return icons?.[cat] || 'Package';
  };

  const getCategoryLabel = (cat, subcat) => {
    const labels = {
      'AI_ML': 'Artificial Intelligence',
      'WEB_DEV': 'Web Development',
      'MOBILE_DEV': 'Mobile Development',
      'DATA_SCIENCE': 'Data Science',
      'DEVOPS': 'DevOps',
      'SECURITY': 'Security',
      'CLOUD': 'Cloud',
      'BLOCKCHAIN': 'Blockchain',
      'IOT': 'Internet of Things',
      'OTHER': 'Other'
    };

    const categoryLabel = labels?.[cat] || cat || 'Other';

    if (subcat && subcat.trim() !== '') {
      return `${categoryLabel} - ${subcat}`;
    }

    return categoryLabel;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'P0_BREAKING': 'bg-red-100 text-red-800 border-red-200',
      'P1_TRENDING': 'bg-orange-100 text-orange-800 border-orange-200',
      'P2_TIMELY': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'P3_EVERGREEN': 'bg-green-100 text-green-800 border-green-200',
      'P4_FILLER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'P0_BREAKING': 'P0 - Breaking',
      'P1_TRENDING': 'P1 - Trending',
      'P2_TIMELY': 'P2 - Timely',
      'P3_EVERGREEN': 'P3 - Evergreen',
      'P4_FILLER': 'P4 - Filler'
    };
    return labels?.[priority] || 'Unknown';
  };

  const getAudienceIcon = (audience) => {
    const icons = {
      'developers': 'Code',
      'architects': 'Building',
      'managers': 'Users',
      'beginners': 'GraduationCap',
      'experts': 'Award',
      'mixed': 'Users'
    };
    return icons?.[audience] || 'Users';
  };

  const getAudienceLabel = (audience) => {
    // Handle predefined codes for backward compatibility
    const labels = {
      'developers': 'Developers',
      'architects': 'Architects',
      'managers': 'Managers',
      'beginners': 'Beginners',
      'experts': 'Experts',
      'mixed': 'Mixed'
    };

    // Return mapped label if it exists, otherwise return the database value directly
    return labels?.[audience] || audience || 'Unknown';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'text-green-600';
    if (conf >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Classification</h2>
      <div className="space-y-6">
        {/* Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Category</h3>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Icon name={getCategoryIcon(category)} size={20} className="text-primary" />
            <span className="font-medium text-foreground">{getCategoryLabel(category, subcategory)}</span>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Priority</h3>
          </div>
          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${getPriorityColor(priority)}`}>
            <Icon name="Flag" size={20} />
            <span className="font-medium">{getPriorityLabel(priority)}</span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Target Audience</h3>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Icon name={getAudienceIcon(targetAudience)} size={20} className="text-primary" />
            <span className="font-medium text-foreground">{getAudienceLabel(targetAudience)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryPanel;