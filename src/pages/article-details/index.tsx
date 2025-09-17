import React, { useState, useEffect } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';
import ArticleHeader from './components/ArticleHeader';
import ScoringPanel from './components/ScoringPanel';
import CategoryPanel from './components/CategoryPanel';
import DecisionPanel from './components/DecisionPanel';
import ArticleContent from './components/ArticleContent';
import ChangeHistory from './components/ChangeHistory';
import ResearchPanel from './components/ResearchPanel';

const ArticleDetails = () => {
  const navigate = useMockNavigate();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedAction, setSelectedAction] = useState(null);
  const [researchData, setResearchData] = useState([]);

  // Get article ID from URL hash
  const getArticleIdFromHash = () => {
    const hash = window.location.hash;
    if (hash.includes('article-details?id=')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      return params.get('id');
    }
    return null;
  };

  // Load research data from API
  const loadResearchData = async (articleId) => {
    try {
      const researchResponse = await api.getResearchMaterials(articleId);
      setResearchData(researchResponse.data || []);
      console.log(`✅ Loaded ${researchResponse.data?.length || 0} research materials for article ${articleId}`);
    } catch (err) {
      console.error('Failed to load research data:', err);
      setResearchData([]);
    }
  };

  // Load article from API
  const loadArticle = async () => {
    const articleId = getArticleIdFromHash();
    if (!articleId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getArticle(parseInt(articleId));
      const articleData = response.data;

      // Load research data for this article
      await loadResearchData(parseInt(articleId));

      // Transform API data to match component expectations
      const transformedArticle = {
        id: articleData.id,
        title: articleData.title,
        author: articleData.author,
        publishedAt: articleData.created_date,
        source: "RSS Feed", // Could be added to backend later
        rssSource: "rss-feed",
        url: articleData.link,
        content: articleData.content,
        summary: articleData.summary,
        category: articleData.category,
        subcategory: articleData.subcategory,
        priority: articleData.priority,
        targetAudience: articleData.target_audience,
        status: articleData.status,
        tags: articleData.tags || [],
        keyTakeaways: articleData.key_takeaways || [],
        reasoning: articleData.reasoning,
        readingTime: Math.ceil((articleData.content?.length || 0) / 200), // Estimate reading time
        language: "Polish",
        region: "Poland",
        // Include scores for analysis tab
        relevance_score: articleData.relevance_score || 0,
        novelty_score: articleData.novelty_score || 0,
        viral_score: articleData.viral_score || 0,
        value_score: articleData.value_score || 0,
        final_score: articleData.final_score || 0
      };

      setArticle(transformedArticle);
    } catch (err) {
      console.error('Failed to load article:', err);
      error('Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock article data (fallback)
  const mockArticle = {
    id: getArticleIdFromHash() || 'ART-2025-001',
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

  // Get scores from current article or use defaults
  const getScores = () => {
    if (article) {
      return {
        relevance: article.relevance_score || 0,
        novelty: article.novelty_score || 0,
        viral: article.viral_score || 0,
        value: article.value_score || 0,
        final: article.final_score || 0
      };
    }
    return {
      relevance: 92,
      novelty: 88,
      viral: 76,
      value: 94,
      final: 87
    };
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
    loadArticle();
  }, []);

  const handleBack = () => {
    navigate('/article-list');
  };

  const handleDecisionMade = async (decision) => {
    console.log('Decision made:', decision);

    if (!article?.id) return;

    try {
      const response = await api.updateArticleStatus(article.id, decision);

      // Update local article state with new status
      setArticle(prev => ({
        ...prev,
        status: response.data.status
      }));

      const actionText = decision.action === 'accept' ? 'accepted' :
                        decision.action === 'reject' ? 'rejected' : 'marked as needing more information';
      success(`Article has been ${actionText}`);
    } catch (err) {
      console.error('Failed to update article status:', err);
      error('Failed to update article status');
    }
  };

  const handleAddResearch = (research) => {
    console.log('Research added:', research);
    // Add new research to the state
    setResearchData(prev => [...prev, { ...research, id: Date.now() }]);
    success('Research has been added successfully');
  };

  const handleActionSelect = (action) => {
    // If the same action is clicked, deselect it
    if (selectedAction === action) {
      setSelectedAction(null);
    } else {
      setSelectedAction(action);
    }
  };

  const handleSaveAction = async () => {
    if (!selectedAction || !article?.id) return;

    try {
      const decision = {
        action: selectedAction,
        articleId: article.id,
        notes: `Article ${selectedAction === 'accept' ? 'accepted' : selectedAction === 'reject' ? 'rejected' : 'marked as needing research'} via quick action`
      };

      const response = await api.updateArticleStatus(article.id, decision);

      setArticle(prev => ({
        ...prev,
        status: response.data.status
      }));

      const actionText = selectedAction === 'accept' ? 'accepted' :
                        selectedAction === 'reject' ? 'rejected' : 'marked as needing research';
      success(`Article has been ${actionText}`);
      setSelectedAction(null);
    } catch (err) {
      console.error('Failed to update article status:', err);
      error('Failed to update article status');
    }
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
            <p className="text-muted-foreground">Loading article details...</p>
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
            <p className="text-foreground text-lg mb-2">Article not found</p>
            <p className="text-muted-foreground mb-4">Check if the article ID is correct</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getVisibleTabs = () => {
    const allTabs = [
      { id: 'content', label: 'Article Content', icon: 'FileText' },
      { id: 'analysis', label: 'AI Analysis', icon: 'Brain' },
      { id: 'decision', label: 'Decision', icon: 'CheckCircle' },
      { id: 'research', label: 'Research', icon: 'Search' },
      { id: 'history', label: 'History', icon: 'History' }
    ];

    // For NEW, REJECTED, and ACCEPTED status articles, only show content tab
    if (article?.status === 'NEW' || article?.status === 'REJECTED' || article?.status === 'ACCEPTED') {
      return allTabs.filter(tab => tab.id === 'content');
    }

    // Filter out research tab if no research data exists
    return allTabs.filter(tab => {
      if (tab.id === 'research') {
        return researchData && researchData.length > 0;
      }
      return true;
    });
  };

  const tabs = getVisibleTabs();

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer removeToast={removeToast} />
      {/* Article Header */}
      <ArticleHeader article={article} onBack={handleBack} />
      {/* Main Content */}
      <div className="w-full px-6 py-8">
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
                <ScoringPanel scores={getScores()} insights={article?.keyTakeaways || []} />
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
                  researchData={researchData}
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* Accept Button - hide if already ACCEPTED */}
                {article?.status !== 'ACCEPTED' && (
                  <button
                    onClick={() => handleActionSelect('accept')}
                    className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-smooth ${
                      selectedAction === 'accept'
                        ? 'bg-green-100 border-green-400 ring-2 ring-green-200'
                        : 'bg-green-50 hover:bg-green-100 border-green-200'
                    }`}
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="font-medium text-green-800">Accept Article</span>
                  </button>
                )}

                {/* Reject Button - hide if already REJECTED */}
                {article?.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleActionSelect('reject')}
                    className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-smooth ${
                      selectedAction === 'reject'
                        ? 'bg-red-100 border-red-400 ring-2 ring-red-200'
                        : 'bg-red-50 hover:bg-red-100 border-red-200'
                    }`}
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✗</span>
                    </div>
                    <span className="font-medium text-red-800">Reject Article</span>
                  </button>
                )}


                {/* Save Button */}
                {selectedAction && (
                  <button
                    onClick={handleSaveAction}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth mt-4"
                  >
                    <span className="font-medium">Save Decision</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Panel - only show for non-NEW, non-REJECTED, and non-ACCEPTED articles */}
            {article?.status !== 'NEW' && article?.status !== 'REJECTED' && article?.status !== 'ACCEPTED' && (
              <CategoryPanel
                category={article?.category}
                subcategory={article?.subcategory}
                priority={article?.priority}
                targetAudience={article?.targetAudience}
                confidence={mockConfidence}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;