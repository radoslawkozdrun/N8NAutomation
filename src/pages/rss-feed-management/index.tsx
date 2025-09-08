import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import FeedTable from './components/FeedTable';
import FeedFilters from './components/FeedFilters';
import AddFeedModal from './components/AddFeedModal';
import FeedStats from './components/FeedStats';
import ErrorLogModal from './components/ErrorLogModal';

const RSSFeedManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isErrorLogModalOpen, setIsErrorLogModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [selectedFeedForErrors, setSelectedFeedForErrors] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    health: ''
  });
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'stats'
  
  const { toasts, addToast, removeToast } = useToast();

  // Mock user data
  const user = {
    name: "Anna Kowalska",
    email: "anna.kowalska@opix.pl",
    role: "Administrator"
  };

  // Mock RSS feeds data
  const [feeds, setFeeds] = useState([
    {
      id: 1,
      name: "TechCrunch AI",
      url: "https://techcrunch.com/category/artificial-intelligence/feed/",
      categories: ["AI_ML", "WEB_DEV"],
      status: "active",
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      articlesCount: 156,
      health: "excellent",
      responseTime: 245,
      description: "Najnowsze wiadomości o sztucznej inteligencji z TechCrunch"
    },
    {
      id: 2,
      name: "Dev.to Web Development",
      url: "https://dev.to/feed/tag/webdev",
      categories: ["WEB_DEV", "MOBILE_DEV"],
      status: "active",
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      articlesCount: 89,
      health: "good",
      responseTime: 412,
      description: "Artykuły o rozwoju aplikacji webowych"
    },
    {
      id: 3,
      name: "Towards Data Science",
      url: "https://towardsdatascience.com/feed",
      categories: ["DATA_SCIENCE", "AI_ML"],
      status: "error",
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
      articlesCount: 234,
      health: "critical",
      responseTime: 1200,
      description: "Publikacje o nauce o danych i uczeniu maszynowym"
    },
    {
      id: 4,
      name: "AWS Blog",
      url: "https://aws.amazon.com/blogs/aws/feed/",
      categories: ["CLOUD", "DEVOPS"],
      status: "active",
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
      articlesCount: 67,
      health: "excellent",
      responseTime: 189,
      description: "Oficjalny blog Amazon Web Services"
    },
    {
      id: 5,
      name: "Krebs on Security",
      url: "https://krebsonsecurity.com/feed/",
      categories: ["SECURITY"],
      status: "active",
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
      articlesCount: 45,
      health: "warning",
      responseTime: 678,
      description: "Najnowsze informacje o cyberbezpieczeństwie"
    },
    {
      id: 6,
      name: "Docker Blog",
      url: "https://www.docker.com/blog/feed/",
      categories: ["DEVOPS", "CLOUD"],
      status: "inactive",
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
      articlesCount: 78,
      health: "good",
      responseTime: 334,
      description: "Oficjalny blog Docker"
    }
  ]);

  const handleLogout = () => {
    addToast('Wylogowano pomyślnie', 'success');
    // Redirect to login
    window.location.href = '/login';
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      health: ''
    });
    addToast('Filtry zostały wyczyszczone', 'info');
  };

  const handleSelectFeed = (feedId, checked) => {
    setSelectedFeeds(prev => 
      checked 
        ? [...prev, feedId]
        : prev?.filter(id => id !== feedId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedFeeds(checked ? filteredFeeds?.map(feed => feed?.id) : []);
  };

  const handleAddFeed = (feedData) => {
    const newFeed = {
      id: Date.now(),
      ...feedData,
      lastUpdated: new Date(),
      articlesCount: 0,
      health: 'good',
      responseTime: Math.floor(Math.random() * 500) + 200
    };
    
    setFeeds(prev => [...prev, newFeed]);
    addToast('Źródło RSS zostało dodane pomyślnie', 'success');
  };

  const handleEditFeed = (feed) => {
    setEditingFeed(feed);
    setIsAddModalOpen(true);
  };

  const handleUpdateFeed = (feedData) => {
    setFeeds(prev => prev?.map(feed => 
      feed?.id === editingFeed?.id 
        ? { ...feed, ...feedData }
        : feed
    ));
    setEditingFeed(null);
    addToast('Źródło RSS zostało zaktualizowane', 'success');
  };

  const handleDeleteFeed = (feedId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to źródło RSS?')) {
      setFeeds(prev => prev?.filter(feed => feed?.id !== feedId));
      setSelectedFeeds(prev => prev?.filter(id => id !== feedId));
      addToast('Źródło RSS zostało usunięte', 'success');
    }
  };

  const handleRefreshFeed = (feedId) => {
    setFeeds(prev => prev?.map(feed => 
      feed?.id === feedId 
        ? { 
            ...feed, 
            lastUpdated: new Date(),
            health: 'excellent',
            responseTime: Math.floor(Math.random() * 300) + 150
          }
        : feed
    ));
    addToast('Źródło RSS zostało odświeżone', 'success');
  };

  const handleBulkAction = (action, feedIds) => {
    switch (action) {
      case 'activate':
        setFeeds(prev => prev?.map(feed => 
          feedIds?.includes(feed?.id) 
            ? { ...feed, status: 'active' }
            : feed
        ));
        addToast(`Aktywowano ${feedIds?.length} źródeł RSS`, 'success');
        break;
      case 'deactivate':
        setFeeds(prev => prev?.map(feed => 
          feedIds?.includes(feed?.id) 
            ? { ...feed, status: 'inactive' }
            : feed
        ));
        addToast(`Dezaktywowano ${feedIds?.length} źródeł RSS`, 'success');
        break;
      case 'refresh':
        setFeeds(prev => prev?.map(feed => 
          feedIds?.includes(feed?.id) 
            ? { 
                ...feed, 
                lastUpdated: new Date(),
                health: 'excellent',
                responseTime: Math.floor(Math.random() * 300) + 150
              }
            : feed
        ));
        addToast(`Odświeżono ${feedIds?.length} źródeł RSS`, 'success');
        break;
      case 'delete':
        if (window.confirm(`Czy na pewno chcesz usunąć ${feedIds?.length} źródeł RSS?`)) {
          setFeeds(prev => prev?.filter(feed => !feedIds?.includes(feed?.id)));
          addToast(`Usunięto ${feedIds?.length} źródeł RSS`, 'success');
        }
        break;
    }
    setSelectedFeeds([]);
  };

  const handleShowErrorLog = (feed) => {
    setSelectedFeedForErrors(feed);
    setIsErrorLogModalOpen(true);
  };

  // Filter feeds based on current filters
  const filteredFeeds = feeds?.filter(feed => {
    if (filters?.search && !feed?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) && 
        !feed?.url?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.category && !feed?.categories?.includes(filters?.category)) {
      return false;
    }
    if (filters?.status && feed?.status !== filters?.status) {
      return false;
    }
    if (filters?.health && feed?.health !== filters?.health) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={handleLogout}
      />
      <main className="transition-smooth">
        <div className="p-6 space-y-6 max-w-full w-full">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Zarządzanie źródłami RSS</h1>
            <p className="text-muted-foreground">
              Konfiguruj i monitoruj źródła treści z kompleksowym śledzeniem kondycji
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('table')}
                iconName="Table"
                iconPosition="left"
              >
                Tabela
              </Button>
              <Button
                variant={currentView === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('stats')}
                iconName="BarChart3"
                iconPosition="left"
              >
                Statystyki
              </Button>
            </div>
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              iconName="Plus"
              iconPosition="left"
            >
              Dodaj źródło RSS
            </Button>
          </div>

          {/* Stats View */}
          {currentView === 'stats' && (
            <FeedStats feeds={filteredFeeds} />
          )}

          {/* Table View */}
          {currentView === 'table' && (
            <>
              {/* Filters */}
              <FeedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                selectedFeeds={selectedFeeds}
                onBulkAction={handleBulkAction}
              />

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Znaleziono: {filteredFeeds?.length} źródeł RSS</span>
                  {selectedFeeds?.length > 0 && (
                    <span className="text-primary">
                      Wybrano: {selectedFeeds?.length}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowErrorLog({ name: 'Wszystkie źródła' })}
                    iconName="AlertTriangle"
                    iconPosition="left"
                  >
                    Dziennik błędów
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="RefreshCw"
                    iconPosition="left"
                    onClick={() => {
                      setFeeds(prev => prev?.map(feed => ({
                        ...feed,
                        lastUpdated: new Date(),
                        health: 'excellent',
                        responseTime: Math.floor(Math.random() * 300) + 150
                      })));
                      addToast('Wszystkie źródła zostały odświeżone', 'success');
                    }}
                  >
                    Odśwież wszystkie
                  </Button>
                </div>
              </div>

              {/* Feed Table */}
              <FeedTable
                feeds={filteredFeeds}
                onEdit={handleEditFeed}
                onDelete={handleDeleteFeed}
                onRefresh={handleRefreshFeed}
                onBulkAction={handleBulkAction}
                selectedFeeds={selectedFeeds}
                onSelectFeed={handleSelectFeed}
                onSelectAll={handleSelectAll}
              />

              {/* Empty State */}
              {filteredFeeds?.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Icon name="Rss" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Brak źródeł RSS
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {filters?.search || filters?.category || filters?.status || filters?.health
                      ? 'Nie znaleziono źródeł RSS spełniających kryteria filtrowania.' :'Rozpocznij od dodania pierwszego źródła RSS do systemu.'
                    }
                  </p>
                  {!(filters?.search || filters?.category || filters?.status || filters?.health) && (
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      iconName="Plus"
                      iconPosition="left"
                    >
                      Dodaj pierwsze źródło RSS
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {/* Modals */}
      <AddFeedModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFeed(null);
        }}
        onSubmit={editingFeed ? handleUpdateFeed : handleAddFeed}
        editingFeed={editingFeed}
      />
      <ErrorLogModal
        isOpen={isErrorLogModalOpen}
        onClose={() => {
          setIsErrorLogModalOpen(false);
          setSelectedFeedForErrors(null);
        }}
        feedId={selectedFeedForErrors?.id}
        feedName={selectedFeedForErrors?.name}
      />
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default RSSFeedManagement;