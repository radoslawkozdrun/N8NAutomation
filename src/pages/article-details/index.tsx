import React, { useState, useEffect } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';
import ArticleHeader from './components/ArticleHeader';
import ScoringPanel from './components/ScoringPanel';
import CategoryPanel from './components/CategoryPanel';
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
    title: "Breakthrough achievements in artificial intelligence in 2025",
    author: "Dr Anna Kowalska",
    publishedAt: "2025-01-05T08:30:00Z",
    source: "TechNews Poland",
    rssSource: "technews-pl-feed",
    url: "https://technews.pl/ai-breakthroughs-2025",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    readingTime: 8,
    language: "English",
    region: "Global",
    status: "PENDING_REVIEW",
    category: "AI_ML",
    priority: "P1_TRENDING",
    targetAudience: "developers",
    tags: ["artificial-intelligence", "machine-learning", "technology", "innovation", "2025"],
    summary: `Article presents the most important achievements in artificial intelligence in the first months of 2025. It discusses new language models, advances in machine learning and practical applications of AI in various industries.`,
    content: `The year 2025 began with spectacular achievements in artificial intelligence that could forever change the way we perceive and use AI technology.

The most important breakthrough is the introduction of a new generation of language models that have achieved an unprecedented level of context understanding and content generation. These models not only better understand human language, but can also conduct more natural and contextual conversations.

In the field of machine learning, we are observing significant advances in reinforcement learning algorithms. New techniques allow for faster and more efficient model training, which translates into better results at lower computational costs.

Particularly interesting are AI applications in medicine, where new diagnostic systems achieve accuracy surpassing human specialists in detecting certain diseases. This could revolutionize healthcare worldwide.

The financial industry is also not lagging behind, introducing advanced AI systems for risk analysis and fraud detection. These solutions enable much faster and more accurate financial decision-making.

We cannot forget about advances in robotics, where AI enables the creation of more autonomous and intelligent robots. These machines can perform increasingly complex tasks, from household chores to complicated industrial operations.

However, ethical and regulatory challenges remain key. Along with the development of AI technology, there is a growing need to develop appropriate legal and ethical frameworks that will ensure safe and responsible use of these technologies.

Experts predict that 2025 will be a breakthrough year for artificial intelligence, and the achievements from the first months are just the beginning of a larger technological revolution.`
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
    "Article contains current information about the latest AI trends",
    "High educational value for developers and architects",
    "Potential to generate high reader engagement",
    "Well-balanced content between theory and practical applications",
    "May become popular on social media"
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
      notes: 'Article automatically downloaded from TechNews Poland RSS feed',
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
      notes: 'Automatic AI analysis completed, article ready for review',
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
      notes: 'Initial review - article requires additional source verification',
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
      notes: 'Source verified - reputable technology portal with 10 years of experience',
      url: 'https://technews.pl/about',
      createdAt: '2025-01-05T09:00:00Z',
      createdBy: 'Maria Wisniewski',
      attachments: [
        { name: 'source-verification-report.pdf' }
      ]
    },
    {
      id: 2,
      type: 'fact_check',
      source: 'AI Research Institute',
      status: 'in_progress',
      notes: 'Fact-checking regarding latest AI achievements - waiting for expert response',
      createdAt: '2025-01-05T09:30:00Z',
      createdBy: 'Jan Kowalski'
    }
  ];

  useEffect(() => {
    loadArticle();
  }, [window.location.hash]); // Reload when hash changes

  // Also listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      loadArticle();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleBack = () => {
    navigate('/article-list');
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
    <div className="h-full flex flex-col p-6 space-y-6">
      <ToastContainer removeToast={removeToast} />
      {/* Article Header */}
      <ArticleHeader article={article} onBack={handleBack} />
      {/* Main Content */}
      <div className="w-full">
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