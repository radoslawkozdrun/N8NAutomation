import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMockNavigate } from '../../utils/mockNavigation';
import { useToast } from '../../components/ui/Toast';
import ArticleSourcePanel from './components/ArticleSourcePanel';
import PostCompositionPanel from './components/PostCompositionPanel';
import PlatformSelector from './components/PlatformSelector';
import AIInsightsPanel from './components/AIInsightsPanel';
import SchedulingModal from './components/SchedulingModal';
import { generateSocialMediaPost, analyzeArticleContent } from '../../utils/aiPostGeneration';

const PostCreation = () => {
  const navigate = useMockNavigate();
  const [searchParams] = useSearchParams();
  const { success, error, info } = useToast();
  
  // State management
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [sourceArticle, setSourceArticle] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');

  // Mock data for demonstration
  const [user] = useState({
    id: 1,
    name: 'Anna Kowalska',
    role: 'CONTENT_MANAGER'
  });

  const [mockArticle] = useState({
    id: searchParams?.get('articleId') || '1',
    title: 'Revolutionizing Web Development with React 18: New Features and Performance Improvements',
    content: 'React 18 introduces groundbreaking features that transform how we build modern web applications. The new concurrent features, Suspense improvements, and automatic batching provide developers with powerful tools for creating more responsive and efficient user interfaces. This comprehensive guide explores the latest capabilities and their practical implementation in real-world projects.',
    author: 'Piotr Nowak',
    publishedAt: new Date('2024-12-15'),
    category: 'Web Development',
    status: 'ACCEPTED',
    insights: {
      targetAudience: 'Web developers, React enthusiasts',
      complexity: 'intermediate',
      keyPoints: [
        'Concurrent features enable better user experience',
        'Suspense improvements for data fetching',
        'Automatic batching reduces unnecessary re-renders'
      ]
    }
  });

  const availablePlatforms = [
    { id: 'blog', name: 'Blog', icon: 'FileText', limits: '2000 characters' },
    { id: 'twitter', name: 'Twitter', icon: 'Twitter', limits: '280 characters' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', limits: '3000 characters' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', limits: '2200 characters' }
  ];

  // Load article data on component mount
  useEffect(() => {
    setSourceArticle(mockArticle);
    handleAnalyzeContent(mockArticle?.content);
  }, []);

  // Handle content analysis
  const handleAnalyzeContent = async (content) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeArticleContent(content);
      setAiInsights(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      error('Nie udało się przeanalizować artykułu');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle post generation
  const handleGeneratePost = async () => {
    if (!sourceArticle) {
      error('Nie wybrano artykułu źródłowego');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateSocialMediaPost(
        sourceArticle?.content, 
        selectedPlatform, 
        selectedTone
      );
      setGeneratedPost(generated);
      setPostContent(generated?.content);
      success('Post został wygenerowany pomyślnie!');
    } catch (err) {
      console.error('Post generation failed:', err);
      error('Nie udało się wygenerować posta');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setGeneratedPost(null);
    setPostContent('');
  };

  // Handle scheduling
  const handleSchedulePost = () => {
    if (!postContent?.trim()) {
      error('Wprowadź treść posta przed zaplanowaniem');
      return;
    }
    setShowScheduling(true);
  };

  // Handle post publishing
  const handlePublishPost = (accountId, scheduledTime = null) => {
    info(`Post zostanie ${scheduledTime ? 'zaplanowany' : 'opublikowany'} na platformie ${selectedPlatform}`);
    setShowScheduling(false);
    
    // Navigate to account management or dashboard
    if (scheduledTime) {
      navigate('/dashboard?tab=scheduled');
    } else {
      navigate('/dashboard?tab=published');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <span>←</span>
              <span>Powrót</span>
            </button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Tworzenie posta społecznościowego
              </h1>
              <p className="text-sm text-muted-foreground">
                Przekształć artykuł w angażujący post dla platform społecznościowych
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

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Source Article */}
          <div className="w-1/2 border-r border-border bg-background">
            <ArticleSourcePanel
              article={sourceArticle}
              aiInsights={aiInsights}
              isAnalyzing={isAnalyzing}
              onAnalyzeContent={handleAnalyzeContent}
            />
          </div>

          {/* Right Panel - Post Composition */}
          <div className="w-1/2 bg-card">
            <PostCompositionPanel
              platform={selectedPlatform}
              postContent={postContent}
              generatedPost={generatedPost}
              isGenerating={isGenerating}
              selectedTone={selectedTone}
              onContentChange={setPostContent}
              onToneChange={setSelectedTone}
              onGeneratePost={handleGeneratePost}
              onSchedulePost={handleSchedulePost}
              onPublishNow={() => handlePublishPost(null)}
              platformLimits={availablePlatforms?.find(p => p?.id === selectedPlatform)?.limits}
            />
          </div>
        </div>

        {/* AI Insights Floating Panel - Mobile */}
        <div className="lg:hidden">
          <AIInsightsPanel
            insights={aiInsights}
            isLoading={isAnalyzing}
          />
        </div>

        {/* Scheduling Modal */}
        {showScheduling && (
          <SchedulingModal
            platform={selectedPlatform}
            postContent={postContent}
            onClose={() => setShowScheduling(false)}
            onPublish={handlePublishPost}
          />
        )}
      </div>
    </div>
  );
};

export default PostCreation;