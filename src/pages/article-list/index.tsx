import React, { useState, useEffect, useMemo } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FilterToolbar from './components/FilterToolbar';
import ArticleTable from './components/ArticleTable';
import BulkActions from './components/BulkActions';
import Pagination from './components/Pagination';

const ArticleList = () => {
  const navigate = useMockNavigate();
  const { toasts, success, error, warning, removeToast } = useToast();
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data State
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  
  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    targetAudience: '',
    scoreRange: {
      finalMin: '',
      finalMax: '',
      relevanceMin: '',
      noveltyMin: '',
      viralMin: ''
    },
    dateFrom: '',
    dateTo: ''
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Sort State
  const [sortConfig, setSortConfig] = useState({
    field: 'publishedAt',
    direction: 'desc'
  });

  // Mock User Data
  const currentUser = {
    id: 1,
    name: "Anna Kowalska",
    email: "anna.kowalska@opix.pl",
    role: "Content Manager"
  };

  // Mock Articles Data
  const mockArticles = [
    {
      id: 1,
      title: "Nowe funkcje React 18: Concurrent Features i Suspense",
      content: `React 18 wprowadza rewolucyjne zmiany w sposobie renderowania komponentów. Concurrent Features pozwalają na przerwanie renderowania w celu obsługi pilniejszych zadań, co znacznie poprawia responsywność aplikacji.\n\nSuspense został rozszerzony o nowe możliwości, umożliwiając lepsze zarządzanie asynchronicznym ładowaniem danych. Te zmiany fundamentalnie wpływają na architekturę nowoczesnych aplikacji React.`,
      author: "Michał Nowak",
      source: "React Blog",
      category: "WEB_DEV",
      priority: "P1_TRENDING",
      status: "PENDING_REVIEW",
      targetAudience: "developers",
      publishedAt: "2025-01-04T10:30:00Z",
      aiScores: {
        relevance: 92.5,
        novelty: 88.3,
        viral: 76.8,
        value: 91.2,
        final: 87.2
      },
      tags: ["React", "JavaScript", "Frontend", "Performance"],
      researchMaterials: [
        {
          title: "React 18 Official Documentation",
          url: "https://react.dev/blog/2022/03/29/react-v18",
          type: "Documentation"
        }
      ]
    },
    {
      id: 2,
      title: "Sztuczna Inteligencja w analizie danych: Przyszłość Data Science",
      content: `Zastosowanie AI w analizie danych rewolucjonizuje sposób, w jaki organizacje podejmują decyzje biznesowe. Machine Learning i Deep Learning umożliwiają automatyzację procesów analitycznych na niespotykaną dotąd skalę.\n\nNarzędzia takie jak AutoML democratyzują dostęp do zaawansowanych technik analitycznych, pozwalając nawet nietechnicznym użytkownikom na tworzenie skutecznych modeli predykcyjnych.`,
      author: "Dr Katarzyna Wiśniewska",
      source: "AI Research Journal",
      category: "AI_ML",
      priority: "P2_TIMELY",
      status: "NEW",
      targetAudience: "experts",
      publishedAt: "2025-01-04T08:15:00Z",
      aiScores: {
        relevance: 89.7,
        novelty: 82.1,
        viral: 71.4,
        value: 88.9,
        final: 83.0
      },
      tags: ["AI", "Machine Learning", "Data Science", "Analytics"],
      researchMaterials: []
    },
    {
      id: 3,
      title: "Bezpieczeństwo aplikacji mobilnych: Najlepsze praktyki 2025",
      content: `Bezpieczeństwo aplikacji mobilnych staje się coraz bardziej krytyczne w dobie rosnących zagrożeń cybernetycznych. Deweloperzy muszą implementować wielowarstwowe mechanizmy ochrony już na etapie projektowania.\n\nOd szyfrowania danych po zabezpieczenia komunikacji API - każdy aspekt aplikacji wymaga szczególnej uwagi. Nowe standardy branżowe wymagają compliance z regulacjami GDPR i innymi przepisami o ochronie danych.`,
      author: "Piotr Kowalczyk",
      source: "Mobile Security Today",
      category: "SECURITY",
      priority: "P0_BREAKING",
      status: "ACCEPTED",
      targetAudience: "developers",
      publishedAt: "2025-01-03T16:45:00Z",
      aiScores: {
        relevance: 94.2,
        novelty: 79.6,
        viral: 85.3,
        value: 93.1,
        final: 88.1
      },
      tags: ["Security", "Mobile", "GDPR", "Encryption"],
      researchMaterials: [
        {
          title: "OWASP Mobile Security Guide",
          url: "https://owasp.org/www-project-mobile-security/",
          type: "Guide"
        }
      ]
    },
    {
      id: 4,
      title: "DevOps w chmurze: Automatyzacja procesów CI/CD z Kubernetes",
      content: `Kubernetes stał się de facto standardem dla orkiestracji kontenerów w środowiskach chmurowych. Integracja z narzędziami CI/CD umożliwia pełną automatyzację procesów deployment i skalowania aplikacji.\n\nNowoczesne pipeline'y DevOps wykorzystują GitOps i Infrastructure as Code do zapewnienia powtarzalności i niezawodności wdrożeń. Monitoring i observability stają się kluczowe dla utrzymania wysokiej dostępności systemów.`,
      author: "Tomasz Zieliński",
      source: "Cloud Native Computing",
      category: "DEVOPS",
      priority: "P2_TIMELY",
      status: "RESEARCH_DONE",
      targetAudience: "architects",
      publishedAt: "2025-01-03T12:20:00Z",
      aiScores: {
        relevance: 87.4,
        novelty: 75.8,
        viral: 68.9,
        value: 86.2,
        final: 79.6
      },
      tags: ["DevOps", "Kubernetes", "CI/CD", "Cloud"],
      researchMaterials: []
    },
    {
      id: 5,
      title: "Blockchain w finansach: DeFi i przyszłość bankowości",
      content: `Decentralized Finance (DeFi) rewolucjonizuje tradycyjny sektor bankowy poprzez eliminację pośredników i automatyzację procesów finansowych za pomocą smart contracts.\n\nProtokóły DeFi oferują nowe możliwości inwestycyjne i pożyczkowe, ale wiążą się również z nowymi rodzajami ryzyka. Regulatorzy na całym świecie pracują nad ramami prawnymi dla tej rozwijającej się technologii.`,
      author: "Magdalena Lewandowska",
      source: "FinTech Weekly",
      category: "BLOCKCHAIN",
      priority: "P3_EVERGREEN",
      status: "REJECTED",
      targetAudience: "mixed",
      publishedAt: "2025-01-02T14:30:00Z",
      aiScores: {
        relevance: 78.3,
        novelty: 84.7,
        viral: 92.1,
        value: 81.5,
        final: 84.2
      },
      tags: ["Blockchain", "DeFi", "Finance", "Smart Contracts"],
      researchMaterials: []
    },
    {
      id: 6,
      title: "Internet of Things: Inteligentne miasta przyszłości",
      content: `IoT transformuje sposób funkcjonowania miast poprzez integrację sensorów, urządzeń i systemów zarządzania w jeden spójny ekosystem. Smart cities wykorzystują dane w czasie rzeczywistym do optymalizacji ruchu, zarządzania energią i poprawy jakości życia mieszkańców.\n\nWyzwania związane z prywatnością, bezpieczeństwem i interoperacyjnością wymagają holistycznego podejścia do projektowania systemów IoT w środowisku miejskim.`,
      author: "Jakub Wójcik",
      source: "Smart City Journal",
      category: "IOT",
      priority: "P4_FILLER",
      status: "ARCHIVED",
      targetAudience: "managers",
      publishedAt: "2025-01-01T09:00:00Z",
      aiScores: {
        relevance: 72.6,
        novelty: 69.4,
        viral: 58.7,
        value: 74.1,
        final: 68.7
      },
      tags: ["IoT", "Smart Cities", "Sensors", "Urban Planning"],
      researchMaterials: []
    }
  ];

  // Initialize data
  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticles(mockArticles);
      setIsLoading(false);
    };

    loadArticles();
  }, []);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = [...articles];

    // Apply filters
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(article =>
        article?.title?.toLowerCase()?.includes(searchLower) ||
        article?.content?.toLowerCase()?.includes(searchLower) ||
        article?.author?.toLowerCase()?.includes(searchLower) ||
        article?.tags?.some(tag => tag?.toLowerCase()?.includes(searchLower))
      );
    }

    if (filters?.status) {
      filtered = filtered?.filter(article => article?.status === filters?.status);
    }

    if (filters?.category) {
      filtered = filtered?.filter(article => article?.category === filters?.category);
    }

    if (filters?.priority) {
      filtered = filtered?.filter(article => article?.priority === filters?.priority);
    }

    if (filters?.targetAudience) {
      filtered = filtered?.filter(article => article?.targetAudience === filters?.targetAudience);
    }

    // Score range filters
    if (filters?.scoreRange?.finalMin) {
      filtered = filtered?.filter(article => article?.aiScores?.final >= parseFloat(filters?.scoreRange?.finalMin));
    }
    if (filters?.scoreRange?.finalMax) {
      filtered = filtered?.filter(article => article?.aiScores?.final <= parseFloat(filters?.scoreRange?.finalMax));
    }
    if (filters?.scoreRange?.relevanceMin) {
      filtered = filtered?.filter(article => article?.aiScores?.relevance >= parseFloat(filters?.scoreRange?.relevanceMin));
    }
    if (filters?.scoreRange?.noveltyMin) {
      filtered = filtered?.filter(article => article?.aiScores?.novelty >= parseFloat(filters?.scoreRange?.noveltyMin));
    }
    if (filters?.scoreRange?.viralMin) {
      filtered = filtered?.filter(article => article?.aiScores?.viral >= parseFloat(filters?.scoreRange?.viralMin));
    }

    // Date filters
    if (filters?.dateFrom) {
      filtered = filtered?.filter(article => new Date(article.publishedAt) >= new Date(filters.dateFrom));
    }
    if (filters?.dateTo) {
      filtered = filtered?.filter(article => new Date(article.publishedAt) <= new Date(filters.dateTo));
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.field];
      let bValue = b?.[sortConfig?.field];

      // Handle nested properties (like aiScores.final)
      if (sortConfig?.field === 'finalScore') {
        aValue = a?.aiScores?.final;
        bValue = b?.aiScores?.final;
      }

      // Handle dates
      if (sortConfig?.field === 'publishedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [articles, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedArticles?.length / itemsPerPage);
  const paginatedArticles = filteredAndSortedArticles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event Handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      priority: '',
      targetAudience: '',
      scoreRange: {
        finalMin: '',
        finalMax: '',
        relevanceMin: '',
        noveltyMin: '',
        viralMin: ''
      },
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleSelectionChange = (articleId, isSelected) => {
    if (isSelected) {
      setSelectedArticles(prev => [...prev, articleId]);
    } else {
      setSelectedArticles(prev => prev?.filter(id => id !== articleId));
    }
  };

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedArticles(paginatedArticles?.map(article => article?.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedArticles([]);
  };

  const handleQuickAction = async (articleId, action) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update article status
      setArticles(prev => prev?.map(article => {
        if (article?.id === articleId) {
          let newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
          return { ...article, status: newStatus };
        }
        return article;
      }));

      const actionText = action === 'accept' ? 'zaakceptowany' : 'odrzucony';
      success(`Artykuł został ${actionText}`);
    } catch (err) {
      error('Wystąpił błąd podczas wykonywania akcji');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedArticles?.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update articles status
      setArticles(prev => prev?.map(article => {
        if (selectedArticles?.includes(article?.id)) {
          let newStatus = article?.status;
          switch (action) {
            case 'accept':
              newStatus = 'ACCEPTED';
              break;
            case 'reject':
              newStatus = 'REJECTED';
              break;
            case 'archive':
              newStatus = 'ARCHIVED';
              break;
            case 'needs_more':
              newStatus = 'NEEDS_MORE';
              break;
            case 'research_done':
              newStatus = 'RESEARCH_DONE';
              break;
          }
          return { ...article, status: newStatus };
        }
        return article;
      }));

      const actionTexts = {
        accept: 'zaakceptowane',
        reject: 'odrzucone',
        archive: 'zarchiwizowane',
        needs_more: 'oznaczone jako wymagające więcej informacji',
        research_done: 'oznaczone jako zbadane'
      };

      success(`${selectedArticles?.length} artykułów zostało ${actionTexts?.[action]}`);
      setSelectedArticles([]);
    } catch (err) {
      error('Wystąpił błąd podczas wykonywania akcji grupowej');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (articleId) => {
    navigate(`/article-details?id=${articleId}`);
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const handleToggleExpand = (articleId) => {
    setExpandedRows(prev => 
      prev?.includes(articleId)
        ? prev?.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedArticles([]); // Clear selection when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedArticles([]);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onLogout={handleLogout} />
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={currentUser}
          onLogout={handleLogout}
        />
        <main className={`transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16`}>
          <div className="p-6">
            <LoadingSpinner size="lg" text="Ładowanie artykułów..." className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onLogout={handleLogout} />
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className={`transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Lista artykułów</h1>
                <p className="text-muted-foreground mt-1">
                  Zarządzaj i przeglądaj artykuły RSS z ocenami AI
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => window.location?.reload()}
                  iconName="RefreshCw"
                  iconPosition="left"
                  disabled={isProcessing}
                >
                  Odśwież
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/rss-feed-management')}
                  iconName="Rss"
                  iconPosition="left"
                >
                  Zarządzaj źródłami
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <FilterToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            totalArticles={articles?.length}
            filteredCount={filteredAndSortedArticles?.length}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedArticles?.length}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            isProcessing={isProcessing}
          />

          {/* Articles Table */}
          <ArticleTable
            articles={paginatedArticles}
            selectedArticles={selectedArticles}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onQuickAction={handleQuickAction}
            onViewDetails={handleViewDetails}
            sortConfig={sortConfig}
            onSort={handleSort}
            expandedRows={expandedRows}
            onToggleExpand={handleToggleExpand}
          />

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedArticles?.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </main>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ArticleList;