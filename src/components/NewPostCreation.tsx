import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from './AppIcon';
import Button from './ui/Button';
import ArticleSourcePanel from './post-creation/ArticleSourcePanel';
import PlatformSelector from './post-creation/PlatformSelector';
import PostCompositionPanel from './post-creation/PostCompositionPanel';
import AIInsightsPanel from './post-creation/AIInsightsPanel';
import SchedulingModal from './post-creation/SchedulingModal';

export function NewPostCreation() {
  // State management
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [postContent, setPostContent] = useState('');
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockSources = {
    rss: {
      enabled: true,
      articles: [
        {
          id: '1',
          title: 'Revolutionizing Web Development with React 18: New Features and Performance Improvements',
          summary: 'React 18 introduces groundbreaking features that transform how we build modern web applications...',
          domain: 'dev.to',
          publishedAt: new Date('2024-12-15'),
          readTime: 8,
          tags: ['react', 'javascript', 'webdev', 'performance'],
          favicon: '/api/favicon/dev.to'
        },
        {
          id: '2',
          title: 'Building Scalable APIs with Node.js and TypeScript',
          summary: 'Learn how to create robust and maintainable APIs using modern Node.js practices...',
          domain: 'medium.com',
          publishedAt: new Date('2024-12-14'),
          readTime: 12,
          tags: ['nodejs', 'typescript', 'api', 'backend'],
          favicon: '/api/favicon/medium.com'
        }
      ]
    },
    blog: {
      enabled: true,
      articles: [
        {
          id: '3',
          title: 'The Future of AI in Content Creation',
          summary: 'Exploring how artificial intelligence is reshaping content creation workflows...',
          domain: 'techblog.com',
          publishedAt: new Date('2024-12-13'),
          readTime: 6,
          tags: ['ai', 'content', 'automation'],
          favicon: '/api/favicon/techblog.com'
        }
      ]
    }
  };

  const availablePlatforms = [
    { id: 'blog', name: 'Blog', icon: 'FileText', limits: '2000 characters' },
    { id: 'twitter', name: 'Twitter', icon: 'Twitter', limits: '280 characters' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', limits: '3000 characters' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', limits: '2200 characters' }
  ];

  const mockSuggestedTimes = {
    twitter: [
      { time: '09:00', engagement: 85, reach: '2.5K' },
      { time: '12:00', engagement: 78, reach: '3.1K' },
      { time: '17:00', engagement: 92, reach: '4.2K' }
    ],
    linkedin: [
      { time: '08:00', engagement: 76, reach: '1.8K' },
      { time: '11:00', engagement: 89, reach: '2.9K' },
      { time: '16:00', engagement: 82, reach: '3.4K' }
    ]
  };

  // Handle platform selection
  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    setPostContent(''); // Clear content when switching platforms
  };

  // Handle source toggle
  const handleSourceToggle = (sourceType) => {
    toast.info(`Przełączanie źródła: ${sourceType}`);
  };

  // Handle article selection
  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    toast.success(`Wybrano artykuł: ${article.title}`);
  };

  // Handle content change
  const handleContentChange = (content) => {
    setPostContent(content);
  };

  // Handle image upload
  const handleImageUpload = (files) => {
    toast.success(`Dodano ${files.length} plików`);
  };

  // Handle hashtag add
  const handleHashtagAdd = (hashtag) => {
    toast.info(`Dodano hashtag: #${hashtag}`);
  };

  // Handle preview
  const handlePreview = () => {
    toast.info('Otwieranie podglądu posta');
  };

  // Handle save
  const handleSave = () => {
    toast.success('Szkic został zapisany');
  };

  // Handle publish
  const handlePublish = () => {
    if (!selectedPlatform) {
      toast.error('Wybierz platformę');
      return;
    }
    
    if (!postContent || !postContent.trim()) {
      toast.error('Wprowadź treść posta');
      return;
    }
    
    setIsSchedulingModalOpen(true);
  };

  // Handle scheduling
  const handleSchedule = (scheduleData) => {
    toast.success('Post został zaplanowany pomyślnie');
    console.log('Schedule data:', scheduleData);
  };

  // Handle insights generation
  const handleGenerateInsights = () => {
    if (!selectedArticle) {
      toast.error('Wybierz artykuł do analizy');
      return;
    }

    setIsLoadingInsights(true);
    
    // Mock AI insights generation
    setTimeout(() => {
      setAiInsights({
        articleAnalysis: {
          viralPotential: 78,
          sentiment: 'positive',
          category: 'technology',
          keyTopics: ['react', 'web development', 'performance']
        },
        platformSuggestions: {
          twitter: {
            score: 82,
            suggestedContent: '🚀 React 18 zmienia oblicze web developmentu! Nowe funkcje jak concurrent rendering i ulepszone Suspense to prawdziwa rewolucja. #React18 #WebDev',
            hashtags: ['React18', 'WebDev', 'JavaScript', 'Performance'],
            bestPostingTime: '17:00',
            expectedReach: '4.2K'
          },
          linkedin: {
            score: 86,
            suggestedContent: 'React 18 introduces groundbreaking concurrent features that transform modern web development. With improved Suspense and automatic batching, developers now have powerful tools for creating responsive user interfaces.',
            hashtags: ['React18', 'WebDevelopment', 'JavaScript', 'Technology'],
            bestPostingTime: '11:00',
            expectedReach: '2.9K'
          }
        },
        optimizationTips: [
          {
            type: 'success',
            message: 'Doskonały czas na publikację - wysokie zaangażowanie użytkowników',
            suggestion: 'Rozważ dodanie call-to-action dla większego zasięgu'
          },
          {
            type: 'warning',
            message: 'Tweet może być za długi dla optymalnego zasięgu',
            suggestion: 'Skróć treść do 240 znaków dla lepszej widoczności'
          }
        ],
        performancePrediction: {
          expectedEngagement: 78,
          expectedReach: '4.2K',
          confidence: 0.85
        }
      });
      setIsLoadingInsights(false);
      toast.success('Wygenerowano insights AI');
    }, 2000);
  };

  // Handle refresh insights
  const handleRefreshInsights = () => {
    handleGenerateInsights();
  };

  // Handle apply suggestion
  const handleApplySuggestion = (platform, suggestion) => {
    if (suggestion.suggestedContent) {
      handleContentChange(suggestion.suggestedContent);
    }
    if (suggestion.hashtags) {
      const currentContent = postContent || '';
      const newContent = currentContent + ' ' + suggestion.hashtags.map(tag => `#${tag}`).join(' ');
      handleContentChange(newContent);
    }
    toast.success(`Zastosowano sugestię dla ${platform}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>Powrót</span>
              </button>
              <div className="h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  NEW - Tworzenie posta
                </h1>
                <p className="text-sm text-muted-foreground">
                  Przekształć artykuł w angażujący post społecznościowy
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <PlatformSelector
                platforms={availablePlatforms}
                selectedPlatform={selectedPlatform}
                onPlatformSelect={handlePlatformSelect}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Source Article + AI Insights */}
          <div className="w-1/2 border-r border-border bg-background">
            <ArticleSourcePanel
              sources={mockSources}
              isLoading={false}
              selectedArticle={selectedArticle}
              onSourceToggle={handleSourceToggle}
              onArticleSelect={handleArticleSelect}
            />
            <AIInsightsPanel
              insights={aiInsights}
              isLoading={isLoadingInsights}
              selectedArticle={selectedArticle}
              selectedPlatforms={[selectedPlatform]}
              onGenerateInsights={handleGenerateInsights}
              onApplySuggestion={handleApplySuggestion}
              onRefreshInsights={handleRefreshInsights}
            />
          </div>

          {/* Right Panel - Post Composition */}
          <div className="w-1/2 bg-card">
            <PostCompositionPanel
              selectedArticle={selectedArticle}
              selectedPlatforms={[selectedPlatform]}
              postContent={{ [selectedPlatform]: postContent }}
              onContentChange={(platform, content) => handleContentChange(content)}
              onImageUpload={handleImageUpload}
              onHashtagAdd={handleHashtagAdd}
              onPreview={handlePreview}
              onSave={handleSave}
              onPublish={handlePublish}
            />
          </div>
        </div>
      </div>

      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        onSchedule={handleSchedule}
        selectedPlatforms={[selectedPlatform]}
        suggestedTimes={mockSuggestedTimes}
      />
    </div>
  );
}