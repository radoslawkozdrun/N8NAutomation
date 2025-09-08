import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryPanel = ({ category, priority, targetAudience, confidence }) => {
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

  const getCategoryLabel = (cat) => {
    const labels = {
      'AI_ML': 'Sztuczna Inteligencja',
      'WEB_DEV': 'Rozwój Web',
      'MOBILE_DEV': 'Rozwój Mobile',
      'DATA_SCIENCE': 'Data Science',
      'DEVOPS': 'DevOps',
      'SECURITY': 'Bezpieczeństwo',
      'CLOUD': 'Chmura',
      'BLOCKCHAIN': 'Blockchain',
      'IOT': 'Internet Rzeczy',
      'OTHER': 'Inne'
    };
    return labels?.[cat] || 'Inne';
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
      'P0_BREAKING': 'P0 - Pilne',
      'P1_TRENDING': 'P1 - Trending',
      'P2_TIMELY': 'P2 - Aktualne',
      'P3_EVERGREEN': 'P3 - Ponadczasowe',
      'P4_FILLER': 'P4 - Wypełniacz'
    };
    return labels?.[priority] || 'Nieznany';
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
    const labels = {
      'developers': 'Deweloperzy',
      'architects': 'Architekci',
      'managers': 'Menedżerowie',
      'beginners': 'Początkujący',
      'experts': 'Eksperci',
      'mixed': 'Mieszana'
    };
    return labels?.[audience] || 'Nieznana';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'text-green-600';
    if (conf >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Klasyfikacja</h2>
      <div className="space-y-6">
        {/* Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Kategoria</h3>
            <span className={`text-sm font-medium ${getConfidenceColor(confidence?.category)}`}>
              {confidence?.category}% pewności
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Icon name={getCategoryIcon(category)} size={20} className="text-primary" />
            <span className="font-medium text-foreground">{getCategoryLabel(category)}</span>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Priorytet</h3>
            <span className={`text-sm font-medium ${getConfidenceColor(confidence?.priority)}`}>
              {confidence?.priority}% pewności
            </span>
          </div>
          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${getPriorityColor(priority)}`}>
            <Icon name="Flag" size={20} />
            <span className="font-medium">{getPriorityLabel(priority)}</span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Grupa docelowa</h3>
            <span className={`text-sm font-medium ${getConfidenceColor(confidence?.audience)}`}>
              {confidence?.audience}% pewności
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Icon name={getAudienceIcon(targetAudience)} size={20} className="text-primary" />
            <span className="font-medium text-foreground">{getAudienceLabel(targetAudience)}</span>
          </div>
        </div>

        {/* Alternative Suggestions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Alternatywne sugestie</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm text-muted-foreground">Data Science</span>
              <span className="text-xs text-muted-foreground">23%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm text-muted-foreground">Cloud</span>
              <span className="text-xs text-muted-foreground">15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPanel;