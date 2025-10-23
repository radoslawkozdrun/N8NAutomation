import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { api } from '../../lib/api';
import { MasterContent, ArticleCategory, TargetAudience, ContentTone } from '../../types';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Plus, 
  X, 
  AlertTriangle,
  FileText,
  Tags,
  User,
  Palette,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

const MasterContentEditPage = () => {
  const { user } = useAuth();
  const { setCurrentView } = useNavigation();
  const { toasts, success, error, removeToast } = useToast();
  
  const [masterContent, setMasterContent] = useState<MasterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<ArticleCategory>('OTHER');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('mixed');
  const [tone, setTone] = useState<ContentTone>('professional');
  
  // New key point/tag input
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newTag, setNewTag] = useState('');

  // Get master content ID from URL hash
  const getMasterContentIdFromHash = () => {
    const hash = window.location.hash;
    if (hash.includes('master-content-edit?id=')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      return params.get('id');
    }
    return null;
  };

  // Mock data for demonstration
  const getMockMasterContent = (id: number) => {
    const mockContents = {
      1: {
        id: 1,
        article_id: 101,
        title: "The Future of Artificial Intelligence in Business - Complete 2025 Guide",
        content: "In 2025, artificial intelligence becomes an essential element of business strategy. Companies use AI to automate processes, analyze data and personalize customer experiences. This article presents the most important trends, challenges and opportunities that AI implementation brings to various economic sectors.\n\nArtificial intelligence is no longer a technology of the future - it is a reality that is already transforming the way companies operate around the world. From automating simple administrative tasks to complex predictive analytics, AI offers unprecedented opportunities to optimize business processes.\n\nKey areas of AI application in business include:\n- Customer service automation through chatbots and virtual assistants\n- Predictive analytics to forecast market trends\n- Supply chain optimization and inventory management\n- Personalization of offers and user experiences\n\nChallenges in implementing AI in organizations are primarily ethical issues, data security and the need to retrain employees. Companies must also deal with growing regulatory requirements regarding the transparency of AI algorithms.",
        summary: "Comprehensive overview of AI's role in business for 2025, with practical implementation guidelines.",
        key_points: [
          "AI automates business processes increasing efficiency by 40%",
          "AI personalization improves customer experiences and increases conversions",
          "Ethical and regulatory challenges require a responsible approach",
          "ROI from AI investments reaches an average of 300% within 2 years"
        ],
        tags: ["ai", "business", "automation", "strategy", "2025"],
        category: "AI_ML" as ArticleCategory,
        target_audience: "managers" as TargetAudience,
        tone: "professional" as ContentTone,
        status: "READY_FOR_REVIEW" as MasterContentStatus,
        created_at: "2025-01-15T10:30:00Z",
        updated_at: "2025-01-15T14:20:00Z",
        created_by: 1,
        updated_by: 1
      },
      2: {
        id: 2,
        article_id: 102,
        title: "React 19: New Features and Changes for Developers",
        content: "React 19 introduces revolutionary changes to the framework ecosystem. New Server Components, improved Hooks and performance optimizations change the way web applications are created. The article discusses all the new features in detail and shows practical implementation examples.\n\nServer Components represent one of the biggest innovations in React 19. They allow components to be rendered directly on the server, which significantly improves application performance and SEO. Server components can connect directly to databases without the need to create additional API layers.\n\nNew Hooks introduced in React 19:\n- useActionState - for managing form state\n- useOptimistic - for optimistic UI updates\n- use - universal hook for handling Promise and Context\n\nPerformance optimizations include improved Reconciler, better component caching and optimized re-rendering. These changes translate into faster application loading and better user experience.",
        summary: "Overview of the most important new features in React 19 with practical code examples.",
        key_points: [
          "Server Components revolutionize server-side rendering",
          "New Hooks simplify application state management",
          "Performance optimizations reduce loading time by 30%",
          "Backward compatibility maintained for React 18"
        ],
        tags: ["react", "javascript", "web-development", "frontend"],
        category: "WEB_DEV" as ArticleCategory,
        target_audience: "developers" as TargetAudience,
        tone: "educational" as ContentTone,
        status: "APPROVED" as MasterContentStatus,
        created_at: "2025-01-14T09:15:00Z",
        updated_at: "2025-01-14T16:45:00Z",
        created_by: 2,
        updated_by: 2
      },
      3: {
        id: 3,
        article_id: 103,
        title: "Cybersecurity in the IoT Era - Protection Against Threats",
        content: "Internet of Things (IoT) creates new opportunities, but also new cybersecurity threats. The article discusses the main attack vectors on IoT devices, protection methods and best practices for implementing security in IoT environments.\n\nIoT devices are often characterized by limited computational resources and weak default security. Manufacturers focus on functionality and costs, often neglecting security aspects. This makes IoT networks an attractive target for cybercriminals.\n\nMost common threats in IoT environments:\n- Weak default passwords and lack of user changes\n- Unsecured communication between devices\n- Lack of regular firmware updates\n- Insufficient network segmentation\n\nA strategic approach to IoT security requires implementing Zero Trust Architecture principles, where every device must be verified before gaining network access.",
        summary: "Guide to securing IoT devices against modern threats.",
        key_points: [
          "IoT devices often have weak default security",
          "Network segmentation key to limiting attack spread",
          "Regular firmware updates reduce risk by 70%",
          "Zero Trust Architecture optimal for IoT environments"
        ],
        tags: ["cybersecurity", "iot", "security", "network"],
        category: "SECURITY" as ArticleCategory,
        target_audience: "architects" as TargetAudience,
        tone: "authoritative" as ContentTone,
        status: "DRAFT" as MasterContentStatus,
        created_at: "2025-01-13T11:20:00Z",
        updated_at: "2025-01-13T15:30:00Z",
        created_by: 3,
        updated_by: 3
      }
    };
    
    return mockContents[id] || mockContents[1];
  };

  // Load master content
  const loadMasterContent = async () => {
    const masterContentId = getMasterContentIdFromHash();
    if (!masterContentId) {
      error('No master content ID provided');
      handleBack();
      return;
    }

    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const response = await api.getMasterContent(parseInt(masterContentId));
        const data = response.data;
        
        setMasterContent(data);
        setTitle(data.title);
        setContent(data.content);
        setSummary(data.summary);
        setKeyPoints(data.key_points || []);
        setTags(data.tags || []);
        setCategory(data.category);
        setTargetAudience(data.target_audience);
        setTone(data.tone);
      } catch (apiError) {
        // Fall back to mock data if API fails
        console.log('API not available, using mock data');
        const data = getMockMasterContent(parseInt(masterContentId));
        
        setMasterContent(data);
        setTitle(data.title);
        setContent(data.content);
        setSummary(data.summary);
        setKeyPoints(data.key_points || []);
        setTags(data.tags || []);
        setCategory(data.category);
        setTargetAudience(data.target_audience);
        setTone(data.tone);
      }
    } catch (err) {
      console.error('Failed to load master content:', err);
      error('Failed to load master content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterContent();
  }, []);

  // Track changes
  useEffect(() => {
    if (!masterContent) return;
    
    const hasAnyChanges = (
      title !== masterContent.title ||
      content !== masterContent.content ||
      summary !== masterContent.summary ||
      JSON.stringify(keyPoints) !== JSON.stringify(masterContent.key_points || []) ||
      JSON.stringify(tags) !== JSON.stringify(masterContent.tags || []) ||
      category !== masterContent.category ||
      targetAudience !== masterContent.target_audience ||
      tone !== masterContent.tone
    );
    
    setHasChanges(hasAnyChanges);
  }, [title, content, summary, keyPoints, tags, category, targetAudience, tone, masterContent]);

  // Handle save
  const handleSave = async () => {
    if (!masterContent) return;
    
    if (!title.trim()) {
      error('Title is required');
      return;
    }
    
    if (!content.trim()) {
      error('Content is required');
      return;
    }
    
    if (!summary.trim()) {
      error('Summary is required');
      return;
    }

    try {
      setSaving(true);
      
      await api.updateMasterContent(masterContent.id, {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        key_points: keyPoints,
        tags: tags,
        category,
        target_audience: targetAudience,
        tone
      });
      
      success('Master content saved successfully');
      setHasChanges(false);
      
      // Reload to get updated data
      await loadMasterContent();
    } catch (err) {
      console.error('Failed to save master content:', err);
      error('Failed to save master content');
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    
    setCurrentView('master-content');
    window.location.hash = 'master-content';
  };

  // Add key point
  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint('');
    }
  };

  // Remove key point
  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  // Add tag
  const addTag = () => {
    const tagValue = newTag.trim().toLowerCase();
    if (tagValue && !tags.includes(tagValue)) {
      setTags([...tags, tagValue]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle Enter key for inputs
  const handleKeyPointKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyPoint();
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading master content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!masterContent) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Master content not found</h3>
            <Button onClick={handleBack}>
              Back to Master Content
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Toast messages will be displayed by ToastProvider */}

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Edit Master Content</h1>
              <p className="text-sm text-muted-foreground">
                ID: {masterContent.id} •
                Status: <span className="font-medium">{masterContent.status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            You have unsaved changes
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {previewMode ? (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
                  <p className="text-muted-foreground mb-6">{summary}</p>
                  
                  {keyPoints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Key Points:</h3>
                      <ul className="space-y-2">
                        {keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-foreground">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-foreground">{content}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Title */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText size={18} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Title</label>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter master content title..."
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  />
                </div>

                {/* Summary */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText size={18} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Summary</label>
                  </div>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Enter content summary..."
                    rows={3}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Key Points */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb size={18} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Key Points</label>
                  </div>
                  
                  <div className="space-y-3">
                    {keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-muted rounded">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="flex-1 text-sm text-foreground">{point}</span>
                        <button
                          onClick={() => removeKeyPoint(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newKeyPoint}
                        onChange={(e) => setNewKeyPoint(e.target.value)}
                        onKeyPress={handleKeyPointKeyPress}
                        placeholder="Add new key point..."
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <Button size="sm" onClick={addKeyPoint} disabled={!newKeyPoint.trim()}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Edit3 size={18} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Content</label>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter master content..."
                    rows={20}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {content.length} characters
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Metadata</h3>
              
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tags size={14} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Category</label>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className="w-full p-2 border border-border rounded bg-background text-foreground text-sm"
                    disabled={previewMode}
                  >
                    <option value="AI_ML">AI/ML</option>
                    <option value="WEB_DEV">Web Development</option>
                    <option value="MOBILE_DEV">Mobile Development</option>
                    <option value="DATA_SCIENCE">Data Science</option>
                    <option value="DEVOPS">DevOps</option>
                    <option value="SECURITY">Security</option>
                    <option value="CLOUD">Cloud</option>
                    <option value="BLOCKCHAIN">Blockchain</option>
                    <option value="IOT">IoT</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target size={14} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Target Audience</label>
                  </div>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                    className="w-full p-2 border border-border rounded bg-background text-foreground text-sm"
                    disabled={previewMode}
                  >
                    <option value="developers">Developers</option>
                    <option value="architects">Architects</option>
                    <option value="managers">Managers</option>
                    <option value="beginners">Beginners</option>
                    <option value="experts">Experts</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette size={14} className="text-primary" />
                    <label className="text-sm font-medium text-foreground">Tone</label>
                  </div>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ContentTone)}
                    className="w-full p-2 border border-border rounded bg-background text-foreground text-sm"
                    disabled={previewMode}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="educational">Educational</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Tags size={18} className="text-primary" />
                <label className="text-sm font-medium text-foreground">Tags</label>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      <span>#{tag}</span>
                      {!previewMode && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                
                {!previewMode && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add tag..."
                      className="flex-1 p-2 border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                      <Plus size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Original Article Info */}
            {masterContent.article && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Original Article</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Title:</strong> {masterContent.article.title}</p>
                  <p><strong>Author:</strong> {masterContent.article.author}</p>
                  <p><strong>Published:</strong> {new Date(masterContent.article.created_date).toLocaleDateString()}</p>
                  {masterContent.article.link && (
                    <p>
                      <strong>Source:</strong>{' '}
                      <a 
                        href={masterContent.article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Original
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterContentEditPage;