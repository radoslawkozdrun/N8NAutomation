import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResearchPanel = ({ researchData, onAddResearch }) => {
  const [isAddingResearch, setIsAddingResearch] = useState(false);
  const [newResearch, setNewResearch] = useState({
    type: '',
    source: '',
    notes: '',
    url: ''
  });

  const researchTypes = [
    { value: 'fact_check', label: 'Fact Check', icon: 'CheckCircle' },
    { value: 'source_verification', label: 'Source Verification', icon: 'Shield' },
    { value: 'competitor_analysis', label: 'Competitor Analysis', icon: 'TrendingUp' },
    { value: 'trend_research', label: 'Trend Research', icon: 'BarChart3' },
    { value: 'expert_opinion', label: 'Expert Opinion', icon: 'User' },
    { value: 'additional_sources', label: 'Additional Sources', icon: 'Link' }
  ];

  const getTypeIcon = (type) => {
    const typeData = researchTypes?.find(t => t?.value === type);
    return typeData ? typeData?.icon : 'FileText';
  };

  const getTypeLabel = (type) => {
    const typeData = researchTypes?.find(t => t?.value === type);
    return typeData ? typeData?.label : type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'in_progress': 'bg-blue-100 text-blue-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'in_progress': 'In Progress'
    };
    return labels?.[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitResearch = async (e) => {
    e?.preventDefault();
    
    if (!newResearch?.type || !newResearch?.source || !newResearch?.notes) {
      return;
    }

    const research = {
      id: Date.now(),
      ...newResearch,
      status: 'pending',
      createdAt: new Date()?.toISOString(),
      createdBy: 'Jan Kowalski'
    };

    onAddResearch(research);
    setNewResearch({ type: '', source: '', notes: '', url: '' });
    setIsAddingResearch(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Research Materials</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingResearch(!isAddingResearch)}
          iconName="Plus"
          iconPosition="left"
        >
          Dodaj badanie
        </Button>
      </div>
      {/* Add Research Form */}
      {isAddingResearch && (
        <div className="mb-6 p-4 bg-muted rounded-lg border">
          <h3 className="text-md font-medium text-foreground mb-4">Nowe badanie</h3>
          <form onSubmit={handleSubmitResearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Typ badania *
                </label>
                <select
                  value={newResearch?.type}
                  onChange={(e) => setNewResearch({ ...newResearch, type: e?.target?.value })}
                  className="w-full p-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Wybierz typ</option>
                  {researchTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Source *
                </label>
                <input
                  type="text"
                  value={newResearch?.source}
                  onChange={(e) => setNewResearch({ ...newResearch, source: e?.target?.value })}
                  placeholder="Source name or expert"
                  className="w-full p-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL (opcjonalnie)
              </label>
              <input
                type="url"
                value={newResearch?.url}
                onChange={(e) => setNewResearch({ ...newResearch, url: e?.target?.value })}
                placeholder="https://example.com"
                className="w-full p-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notatki *
              </label>
              <textarea
                value={newResearch?.notes}
                onChange={(e) => setNewResearch({ ...newResearch, notes: e?.target?.value })}
                placeholder="Opisz wyniki badania lub dodatkowe informacje..."
                className="w-full h-24 p-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddingResearch(false)}
              >
                Anuluj
              </Button>
              <Button type="submit">
                Dodaj badanie
              </Button>
            </div>
          </form>
        </div>
      )}
      {/* Research List */}
      <div className="space-y-4">
        {researchData?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No research materials</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add the first research to start tracking sources
            </p>
          </div>
        ) : (
          researchData?.map((research) => (
            <div key={research?.id} className="border border-border rounded-lg p-4 space-y-4">
              {/* Header with Query and Source Type */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getTypeIcon(research?.research_type)} size={16} className="text-primary" />
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {research?.research_type || 'Unknown Type'}
                    </span>
                  </div>
                  {research?.query && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Query:</h4>
                      <p className="text-sm text-foreground font-medium">{research.query}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {research?.source_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ExternalLink"
                      onClick={() => window.open(research?.source_url, '_blank')}
                      title="Open source"
                    />
                  )}
                  <Button variant="ghost" size="sm" iconName="MoreVertical" />
                </div>
              </div>

              {/* Title */}
              {research?.title && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Title:</h4>
                  <h3 className="text-lg font-semibold text-foreground">{research.title}</h3>
                </div>
              )}

              {/* Content */}
              {research?.content && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Content:</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{research.content}</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Added: {formatDate(research?.created_at)}</span>
                  {research?.author && <span>Author: {research.author}</span>}
                  {research?.publication_date && <span>Published: {formatDate(research.publication_date)}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Research Statistics */}
      {researchData?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {researchData?.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {researchData?.filter(r => r?.status === 'completed')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {researchData?.filter(r => r?.status === 'in_progress')?.length}
              </div>
              <div className="text-sm text-muted-foreground">W trakcie</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {researchData?.filter(r => r?.status === 'pending')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Oczekuje</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPanel;