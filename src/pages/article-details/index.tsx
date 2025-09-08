import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMockNavigate } from '../../utils/mockNavigation';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import ArticleHeader from './components/ArticleHeader';
import ScoringPanel from './components/ScoringPanel';
import CategoryPanel from './components/CategoryPanel';
import DecisionPanel from './components/DecisionPanel';
import ArticleContent from './components/ArticleContent';
import ChangeHistory from './components/ChangeHistory';
import ResearchPanel from './components/ResearchPanel';

const ArticleDetails = () => {
  const navigate = useMockNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  // Mock article data
  const mockArticle = {
    id: searchParams?.get('id') || 'ART-2025-001',
    title: "Przełomowe osiągnięcia w dziedzinie sztucznej inteligencji w 2025 roku",
    author: "Dr Anna Kowalska",
    publishedAt: "2025-01-05T08:30:00Z",
    source: "TechNews Poland",
    rssSource: "technews-pl-feed",
    url: "https://technews.pl/ai-breakthroughs-2025",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    readingTime: 8,
    language: "Polski",
    region: "Polska",
    status: "PENDING_REVIEW",
    category: "AI_ML",
    priority: "P1_TRENDING",
    targetAudience: "developers",
    tags: ["sztuczna-inteligencja", "machine-learning", "technologia", "innowacje", "2025"],
    summary: `Artykuł przedstawia najważniejsze osiągnięcia w dziedzinie sztucznej inteligencji w pierwszych miesiącach 2025 roku. Omawia nowe modele językowe, postępy w uczeniu maszynowym oraz praktyczne zastosowania AI w różnych branżach.`,
    content: `Rok 2025 rozpoczął się spektakularnymi osiągnięciami w dziedzinie sztucznej inteligencji, które mogą na zawsze zmienić sposób, w jaki postrzegamy i wykorzystujemy technologię AI.

Najważniejszym przełomem jest wprowadzenie nowej generacji modeli językowych, które osiągnęły bezprecedensowy poziom zrozumienia kontekstu i generowania treści. Te modele nie tylko lepiej rozumieją ludzki język, ale także potrafią prowadzić bardziej naturalne i kontekstowe rozmowy.

W dziedzinie uczenia maszynowego obserwujemy znaczące postępy w algorytmach uczenia ze wzmocnieniem. Nowe techniki pozwalają na szybsze i bardziej efektywne trenowanie modeli, co przekłada się na lepsze wyniki przy mniejszych kosztach obliczeniowych.

Szczególnie interesujące są zastosowania AI w medycynie, gdzie nowe systemy diagnostyczne osiągają dokładność przewyższającą ludzkich specjalistów w wykrywaniu niektórych chorób. To może zrewolucjonizować opiekę zdrowotną na całym świecie.

Branża finansowa również nie pozostaje w tyle, wprowadzając zaawansowane systemy AI do analizy ryzyka i wykrywania oszustw. Te rozwiązania pozwalają na znacznie szybsze i dokładniejsze podejmowanie decyzji finansowych.

Nie można zapomnieć o postępach w dziedzinie robotyki, gdzie AI umożliwia tworzenie bardziej autonomicznych i inteligentnych robotów. Te maszyny mogą wykonywać coraz bardziej złożone zadania, od prac domowych po skomplikowane operacje przemysłowe.

Wyzwania etyczne i regulacyjne pozostają jednak kluczowe. Wraz z rozwojem technologii AI, rośnie potrzeba opracowania odpowiednich ram prawnych i etycznych, które zapewnią bezpieczne i odpowiedzialne wykorzystanie tych technologii.

Eksperci przewidują, że 2025 rok będzie przełomowy dla sztucznej inteligencji, a osiągnięcia z pierwszych miesięcy to dopiero początek większej rewolucji technologicznej.`
  };

  const mockScores = {
    relevance: 92,
    novelty: 88,
    viral: 76,
    value: 94,
    final: 87
  };

  const mockInsights = [
    "Artykuł zawiera aktualne informacje o najnowszych trendach w AI",
    "Wysoka wartość edukacyjna dla deweloperów i architektów",
    "Potencjał do generowania wysokiego zaangażowania czytelników",
    "Dobrze zbalansowana treść między teorią a praktycznymi zastosowaniami",
    "Może stać się popularny w mediach społecznościowych"
  ];

  const mockConfidence = {
    category: 94,
    priority: 87,
    audience: 91
  };

  const mockHistory = [
    {
      id: 1,
      action: 'created',
      user: 'System RSS',
      timestamp: '2025-01-05T08:35:00Z',
      notes: 'Artykuł automatycznie pobrany z RSS feed TechNews Poland',
      metadata: {
        ip: '192.168.1.100',
        userAgent: 'RSS-Bot/1.0',
        sessionId: 'rss-session-001'
      }
    },
    {
      id: 2,
      action: 'status_changed',
      user: 'AI System',
      timestamp: '2025-01-05T08:36:00Z',
      fromStatus: 'NEW',
      toStatus: 'PENDING_REVIEW',
      notes: 'Automatyczna analiza AI zakończona, artykuł gotowy do recenzji',
      changes: [
        { field: 'Status', oldValue: 'NEW', newValue: 'PENDING_REVIEW' },
        { field: 'AI Score', oldValue: 'null', newValue: '87' }
      ],
      metadata: {
        ip: '10.0.0.50',
        userAgent: 'AI-Analyzer/2.1',
        sessionId: 'ai-analysis-session-123'
      }
    },
    {
      id: 3,
      action: 'reviewed',
      user: 'Piotr Nowak',
      timestamp: '2025-01-05T09:15:00Z',
      notes: 'Wstępna recenzja - artykuł wymaga dodatkowej weryfikacji źródeł',
      metadata: {
        ip: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'user-session-456'
      }
    }
  ];

  const mockResearchData = [
    {
      id: 1,
      type: 'source_verification',
      source: 'TechNews Poland',
      status: 'completed',
      notes: 'Źródło zweryfikowane - renomowany portal technologiczny z 10-letnim doświadczeniem',
      url: 'https://technews.pl/about',
      createdAt: '2025-01-05T09:00:00Z',
      createdBy: 'Maria Wiśniewska',
      attachments: [
        { name: 'source-verification-report.pdf' }
      ]
    },
    {
      id: 2,
      type: 'fact_check',
      source: 'AI Research Institute',
      status: 'in_progress',
      notes: 'Sprawdzanie faktów dotyczących najnowszych osiągnięć w AI - oczekiwanie na odpowiedź eksperta',
      createdAt: '2025-01-05T09:30:00Z',
      createdBy: 'Jan Kowalski'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setArticle(mockArticle);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate('/article-list');
  };

  const handleDecisionMade = (decision) => {
    console.log('Decision made:', decision);
    // Update article status based on decision
    const statusMap = {
      'accept': 'ACCEPTED',
      'reject': 'REJECTED',
      'needs_more': 'NEEDS_MORE'
    };
    
    setArticle(prev => ({
      ...prev,
      status: statusMap?.[decision?.action]
    }));
  };

  const handleAddResearch = (research) => {
    console.log('Research added:', research);
    success('Badanie zostało dodane pomyślnie');
  };

  // Add removeToast function for ToastContainer
  const removeToast = (id) => {
    // Mock implementation - in real app this would remove toast by id
    console.log('Removing toast:', id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie szczegółów artykułu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-foreground text-lg mb-2">Artykuł nie został znaleziony</p>
            <p className="text-muted-foreground mb-4">Sprawdź czy ID artykułu jest poprawne</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
            >
              Powrót do listy
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Treść artykułu', icon: 'FileText' },
    { id: 'analysis', label: 'Analiza AI', icon: 'Brain' },
    { id: 'decision', label: 'Decyzja', icon: 'CheckCircle' },
    { id: 'research', label: 'Badania', icon: 'Search' },
    { id: 'history', label: 'Historia', icon: 'History' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer removeToast={removeToast} />
      {/* Article Header */}
      <ArticleHeader article={article} onBack={handleBack} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Navigation */}
            <div className="bg-card border border-border rounded-lg p-1">
              <div className="flex flex-wrap gap-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'content' && (
                <ArticleContent article={article} />
              )}
              
              {activeTab === 'analysis' && (
                <ScoringPanel scores={mockScores} insights={mockInsights} />
              )}
              
              {activeTab === 'decision' && (
                <DecisionPanel
                  articleId={article?.id}
                  currentStatus={article?.status}
                  onDecisionMade={handleDecisionMade}
                />
              )}
              
              {activeTab === 'research' && (
                <ResearchPanel
                  researchData={mockResearchData}
                  onAddResearch={handleAddResearch}
                />
              )}
              
              {activeTab === 'history' && (
                <ChangeHistory history={mockHistory} />
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Szybkie akcje</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('decision')}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-smooth"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="font-medium text-green-800">Zaakceptuj artykuł</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('decision')}
                  className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-smooth"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✗</span>
                  </div>
                  <span className="font-medium text-red-800">Odrzuć artykuł</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('research')}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-smooth"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">?</span>
                  </div>
                  <span className="font-medium text-orange-800">Wymaga badań</span>
                </button>
              </div>
            </div>

            {/* Category Panel */}
            <CategoryPanel
              category={article?.category}
              priority={article?.priority}
              targetAudience={article?.targetAudience}
              confidence={mockConfidence}
            />

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Statystyki</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocena AI:</span>
                  <span className="font-semibold text-foreground">{mockScores?.final}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Czas czytania:</span>
                  <span className="font-semibold text-foreground">{article?.readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Słowa kluczowe:</span>
                  <span className="font-semibold text-foreground">{article?.tags?.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Badania:</span>
                  <span className="font-semibold text-foreground">{mockResearchData?.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;