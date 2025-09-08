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
    { value: 'fact_check', label: 'Sprawdzenie faktów', icon: 'CheckCircle' },
    { value: 'source_verification', label: 'Weryfikacja źródła', icon: 'Shield' },
    { value: 'competitor_analysis', label: 'Analiza konkurencji', icon: 'TrendingUp' },
    { value: 'trend_research', label: 'Badanie trendów', icon: 'BarChart3' },
    { value: 'expert_opinion', label: 'Opinia eksperta', icon: 'User' },
    { value: 'additional_sources', label: 'Dodatkowe źródła', icon: 'Link' }
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
      'pending': 'Oczekuje',
      'completed': 'Zakończone',
      'failed': 'Niepowodzenie',
      'in_progress': 'W trakcie'
    };
    return labels?.[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pl-PL', {
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
        <h2 className="text-lg font-semibold text-foreground">Materiały badawcze</h2>
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
                  Źródło *
                </label>
                <input
                  type="text"
                  value={newResearch?.source}
                  onChange={(e) => setNewResearch({ ...newResearch, source: e?.target?.value })}
                  placeholder="Nazwa źródła lub eksperta"
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
            <p className="text-muted-foreground">Brak materiałów badawczych</p>
            <p className="text-sm text-muted-foreground mt-2">
              Dodaj pierwsze badanie, aby rozpocząć śledzenie źródeł
            </p>
          </div>
        ) : (
          researchData?.map((research) => (
            <div key={research?.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getTypeIcon(research?.type)} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-foreground">{getTypeLabel(research?.type)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(research?.status)}`}>
                        {getStatusLabel(research?.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Źródło: {research?.source}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dodane {formatDate(research?.createdAt)} przez {research?.createdBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {research?.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ExternalLink"
                      onClick={() => window.open(research?.url, '_blank')}
                    />
                  )}
                  <Button variant="ghost" size="sm" iconName="MoreVertical" />
                </div>
              </div>

              {research?.notes && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground">{research?.notes}</p>
                </div>
              )}

              {research?.attachments && research?.attachments?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Załączniki:</h4>
                  <div className="flex flex-wrap gap-2">
                    {research?.attachments?.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-lg">
                        <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{attachment?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="text-sm text-muted-foreground">Łącznie</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {researchData?.filter(r => r?.status === 'completed')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Zakończone</div>
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