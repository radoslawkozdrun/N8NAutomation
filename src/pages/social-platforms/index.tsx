import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { api } from '../../lib/api';
import {
  PlatformContent,
  SocialPlatform,
  PublishDecision,
  SocialMediaAccount,
  MasterContent,
  ArticleCategory,
  TargetAudience,
  ContentTone,
  MasterContentStatus,
  PlatformContentStatus
} from '../../types';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import {
  ArrowLeft,
  Send,
  Clock,
  X,
  Calendar,
  Users,
  RefreshCw,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Settings,
  Hash,
  AtSign,
  Image,
  CheckCircle,
  XCircle,
  Pause,
  Zap
} from 'lucide-react';

const SocialPlatformsPage = () => {
  const { user } = useAuth();
  const { setCurrentView } = useNavigation();
  const { success, error } = useToast();

  const [platformContents, setPlatformContents] = useState<PlatformContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterContent, setMasterContent] = useState<MasterContent | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<Record<SocialPlatform, SocialMediaAccount[]>>({
    TWITTER: [],
    LINKEDIN: [],
    FACEBOOK: [],
    INSTAGRAM: [],
    TIKTOK: []
  });

  // Decision modal state
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    platformContent: PlatformContent | null;
    decision: PublishDecision | null;
  }>({
    isOpen: false,
    platformContent: null,
    decision: null
  });

  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Get master content ID from URL hash
  const getMasterContentIdFromHash = () => {
    const hash = window.location.hash;
    if (hash.includes('master_content_id=')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      return params.get('master_content_id');
    }
    return null;
  };

  // Mock data for demonstration
  const getMockMasterContent = (id: number) => {
    return {
      id: id,
      article_id: 101 + id,
      title: "The Future of Artificial Intelligence in Business - Complete 2025 Guide",
      content: "In 2025, artificial intelligence becomes an essential element of business strategy...",
      summary: "Comprehensive overview of AI's role in business for 2025, with practical implementation guidelines.",
      key_points: [
        "AI automates business processes increasing efficiency by 40%",
        "AI personalization improves customer experiences and increases conversions",
        "Ethical and regulatory challenges require a responsible approach"
      ],
      tags: ["ai", "business", "automation", "strategy", "2025"],
      category: "AI_ML" as ArticleCategory,
      target_audience: "managers" as TargetAudience,
      tone: "professional" as ContentTone,
      status: "APPROVED" as MasterContentStatus,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T14:20:00Z",
      created_by: 1,
      updated_by: 1
    };
  };

  const getMockPlatformContents = (masterContentId?: number) => {
    const baseContents = [
      {
        id: 1,
        master_content_id: masterContentId || 1,
        platform: 'TWITTER' as SocialPlatform,
        content: "🚀 Artificial Intelligence revolutionizes business! In 2025, AI increases process efficiency by 40% and provides an average 300% ROI within 2 years. Is your company already leveraging AI potential? 🤖\n\n🔗 Read the complete guide",
        hashtags: ['AI', 'Business', 'Innovation', 'Tech2025', 'Automation'],
        mentions: ['TechInnovator', 'AIExperts'],
        media_urls: [],
        scheduled_for: null,
        status: 'READY_FOR_REVIEW' as PlatformContentStatus,
        decision: 'PENDING' as PublishDecision,
        target_accounts: [],
        created_at: '2025-01-15T15:00:00Z',
        updated_at: '2025-01-15T15:00:00Z',
        published_at: null
      },
      {
        id: 2,
        master_content_id: masterContentId || 1,
        platform: 'LINKEDIN' as SocialPlatform,
        content: "The future of business lies in artificial intelligence 📊\n\nIn 2025, we observe unprecedented growth in AI implementation in organizations worldwide. Key benefits:\n\n• 40% increase in business process efficiency\n• Better personalization of customer experiences\n• 300% ROI from AI investments within 2 years\n\nDoes your organization already have an AI strategy? Share your experiences in the comments!",
        hashtags: ['AI', 'BusinessStrategy', 'Innovation', 'DigitalTransformation', 'Leadership'],
        mentions: ['LinkedInExpert'],
        media_urls: [],
        scheduled_for: null,
        status: 'READY_FOR_REVIEW' as PlatformContentStatus,
        decision: 'PENDING' as PublishDecision,
        target_accounts: [],
        created_at: '2025-01-15T15:05:00Z',
        updated_at: '2025-01-15T15:05:00Z',
        published_at: null
      },
      {
        id: 3,
        master_content_id: masterContentId || 1,
        platform: 'FACEBOOK' as SocialPlatform,
        content: "Artificial Intelligence is changing the face of business! 🎆\n\nIn our latest guide you will learn:\n🔹 How AI automates processes and increases efficiency\n🔹 What are the best implementation practices\n🔹 How to address ethical and regulatory challenges\n🔹 Why AI ROI reaches 300% in 2 years\n\nWhat do you think about the future of AI in your industry? 💭",
        hashtags: ['AI', 'Business', 'Innovation', 'Technology', 'Future'],
        mentions: [],
        media_urls: [],
        scheduled_for: null,
        status: 'READY_FOR_REVIEW' as PlatformContentStatus,
        decision: 'PENDING' as PublishDecision,
        target_accounts: [],
        created_at: '2025-01-15T15:10:00Z',
        updated_at: '2025-01-15T15:10:00Z',
        published_at: null
      }
    ];

    return baseContents;
  };

  const getMockSocialAccounts = (): Record<SocialPlatform, SocialMediaAccount[]> => {
    return {
      TWITTER: [
        {
          id: 1,
          platform: 'TWITTER' as SocialPlatform,
          username: 'techcompany_pl',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        },
        {
          id: 2,
          platform: 'TWITTER' as SocialPlatform,
          username: 'ceo_techcompany',
          display_name: 'CEO Tech Company',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      LINKEDIN: [
        {
          id: 3,
          platform: 'LINKEDIN' as SocialPlatform,
          username: 'tech-company-poland',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      FACEBOOK: [
        {
          id: 4,
          platform: 'FACEBOOK' as SocialPlatform,
          username: 'techcompanypoland',
          display_name: 'Tech Company Poland',
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        }
      ],
      INSTAGRAM: [],
      TIKTOK: []
    };
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);

      const masterContentId = getMasterContentIdFromHash();

      // Try to load from API first, fall back to mock data
      try {
        if (masterContentId) {
          // Load specific master content and its platform contents
          const masterContentResponse = await api.getMasterContent(parseInt(masterContentId));
          setMasterContent(masterContentResponse.data);

          const platformResponse = await api.getPlatformContents({
            master_content_id: parseInt(masterContentId)
          });
          setPlatformContents(platformResponse.data);
        } else {
          // Load all platform contents
          const response = await api.getPlatformContents({}, 1, 50);
          setPlatformContents(response.data);
        }

        // Load social media accounts for each platform
        const platforms: SocialPlatform[] = ['TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK'];
        const accountsData: Record<SocialPlatform, SocialMediaAccount[]> = {
          TWITTER: [],
          LINKEDIN: [],
          FACEBOOK: [],
          INSTAGRAM: [],
          TIKTOK: []
        };

        await Promise.all(
          platforms.map(async (platform) => {
            try {
              const accountsResponse = await api.getSocialMediaAccountsByPlatform(platform);
              accountsData[platform] = accountsResponse.data;
            } catch (err) {
              console.warn(`Failed to load accounts for ${platform}:`, err);
            }
          })
        );

        setAvailableAccounts(accountsData);
      } catch (apiError) {
        // Fall back to mock data if API fails
        console.log('API not available, using mock data');

        if (masterContentId) {
          const mockMasterContent = getMockMasterContent(parseInt(masterContentId));
          setMasterContent(mockMasterContent);
          const mockPlatformContents = getMockPlatformContents(parseInt(masterContentId));
          setPlatformContents(mockPlatformContents);
        } else {
          const mockPlatformContents = getMockPlatformContents();
          setPlatformContents(mockPlatformContents);
        }

        const mockAccounts = getMockSocialAccounts();
        setAvailableAccounts(mockAccounts);
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
      error('Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate platform content
  const generatePlatformContent = async (platform: SocialPlatform) => {
    if (!masterContent) return;

    try {
      await api.generatePlatformContent(masterContent.id, platform);
      success(`Generated content for ${platform}`);
      loadData();
    } catch (err) {
      error(`Failed to generate content for ${platform}`);
    }
  };

  // Open decision modal
  const openDecisionModal = (platformContent: PlatformContent, decision: PublishDecision) => {
    setDecisionModal({
      isOpen: true,
      platformContent,
      decision
    });
    setSelectedAccounts([]);
    setScheduledDateTime('');
    setDecisionNotes('');
  };

  // Close decision modal
  const closeDecisionModal = () => {
    setDecisionModal({
      isOpen: false,
      platformContent: null,
      decision: null
    });
  };

  // Submit decision
  const submitDecision = async () => {
    if (!decisionModal.platformContent || !decisionModal.decision) return;

    try {
      const decisionData = {
        decision: decisionModal.decision,
        target_accounts: decisionModal.decision === 'DECLINE' || decisionModal.decision === 'POSTPONE' ? [] : selectedAccounts,
        scheduled_for: decisionModal.decision === 'PUBLISH_ON_SCHEDULE' ? scheduledDateTime : undefined,
        notes: decisionNotes || undefined,
        user_id: user?.id || 0
      };

      await api.makePublishDecision(decisionModal.platformContent.id, decisionData);
      success(`Decision "${decisionModal.decision}" submitted successfully`);
      closeDecisionModal();
      loadData();
    } catch (err) {
      error('Failed to submit decision');
    }
  };

  // Platform icon mapping
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'TWITTER': return Twitter;
      case 'LINKEDIN': return Linkedin;
      case 'FACEBOOK': return Facebook;
      case 'INSTAGRAM': return Instagram;
      case 'TIKTOK': return Settings; // Using Settings as placeholder for TikTok
      default: return Settings;
    }
  };

  // Platform color mapping
  const getPlatformColor = (platform: SocialPlatform) => {
    switch (platform) {
      case 'TWITTER': return 'bg-blue-500';
      case 'LINKEDIN': return 'bg-blue-700';
      case 'FACEBOOK': return 'bg-blue-600';
      case 'INSTAGRAM': return 'bg-pink-500';
      case 'TIKTOK': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return CheckCircle;
      case 'FAILED': return XCircle;
      case 'SCHEDULED': return Calendar;
      case 'POSTPONED': return Pause;
      default: return Clock;
    }
  };

  // Go back
  const handleBack = () => {
    if (masterContent) {
      setCurrentView('master-content');
      window.location.hash = 'master-content';
    } else {
      // Go to a default view
      setCurrentView('master-content');
      window.location.hash = 'master-content';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading platform content...</p>
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
              <h1 className="skote-page-title">Social Platforms</h1>
              <p className="text-muted-foreground mt-2">
                {masterContent
                  ? `Platform content for: ${masterContent.title}`
                  : 'Manage content across social media platforms'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={loadData}
              variant="outline"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {/* Generate Content Section */}
        {masterContent && (
          <div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Generate Platform Content</h2>
              <p className="text-muted-foreground mb-4">
                Create optimized content for each social media platform based on your master content.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(['TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK'] as SocialPlatform[]).map((platform) => {
                  const Icon = getPlatformIcon(platform);
                  const existing = platformContents.find(pc => pc.platform === platform);

                  return (
                    <Button
                      key={platform}
                      onClick={() => generatePlatformContent(platform)}
                      variant="outline"
                      disabled={!!existing}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getPlatformColor(platform)}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm">{platform}</span>
                      {existing && <span className="text-xs text-green-600">Generated</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Platform Contents */}
        <div className="grid gap-6">
          {platformContents.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No platform content found</h3>
              <p className="text-muted-foreground">
                {masterContent
                  ? 'Generate content for social platforms using the buttons above'
                  : 'Platform content will appear here when generated from master content'
                }
              </p>
            </div>
          ) : (
            platformContents.map((platformContent) => {
              const Icon = getPlatformIcon(platformContent.platform);
              const StatusIcon = getStatusIcon(platformContent.status);
              const availablePlatformAccounts = availableAccounts[platformContent.platform] || [];

              return (
                <div key={platformContent.id} className="bg-card border border-border rounded-lg">
                  {/* Platform Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getPlatformColor(platformContent.platform)}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{platformContent.platform}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <StatusIcon size={14} />
                          <span>{platformContent.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {platformContent.decision === 'PENDING' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openDecisionModal(platformContent, 'PUBLISH')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Zap size={14} className="mr-1" />
                            Publish Now
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openDecisionModal(platformContent, 'PUBLISH_ON_SCHEDULE')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Calendar size={14} className="mr-1" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDecisionModal(platformContent, 'POSTPONE')}
                          >
                            <Pause size={14} className="mr-1" />
                            Postpone
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDecisionModal(platformContent, 'DECLINE')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X size={14} className="mr-1" />
                            Decline
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Decision: {platformContent.decision}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4">
                    <div className="mb-4">
                      <textarea
                        value={platformContent.content}
                        readOnly
                        rows={4}
                        className="w-full p-3 border border-border rounded bg-muted text-foreground resize-none text-sm"
                      />
                    </div>

                    {/* Hashtags and Mentions */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {platformContent.hashtags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Hash size={14} />
                          <div className="flex flex-wrap gap-1">
                            {platformContent.hashtags.map((tag, index) => (
                              <span key={index} className="text-blue-600">#{tag}</span>
                            ))}
                          </div>
                        </div>

                      )}

                      {platformContent.mentions.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <AtSign size={14} />
                          <div className="flex flex-wrap gap-1">
                            {platformContent.mentions.map((mention, index) => (
                              <span key={index} className="text-blue-600">@{mention}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {platformContent.media_urls && platformContent.media_urls.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Image size={14} />
                          <span>{platformContent.media_urls.length} media file(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Scheduled Info */}
                    {platformContent.scheduled_for && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <Calendar size={14} />
                        <span>Scheduled for: {new Date(platformContent.scheduled_for).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Target Accounts */}
                    {platformContent.target_accounts.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users size={14} />
                        <span>Target accounts: {platformContent.target_accounts.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {
        decisionModal.isOpen && decisionModal.platformContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  {decisionModal.decision === 'PUBLISH' && 'Publish Now'}
                  {decisionModal.decision === 'PUBLISH_ON_SCHEDULE' && 'Schedule Publication'}
                  {decisionModal.decision === 'POSTPONE' && 'Postpone Decision'}
                  {decisionModal.decision === 'DECLINE' && 'Decline Content'}
                </h3>
                <button
                  onClick={closeDecisionModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Platform Info */}
                <div className="flex items-center space-x-3 p-3 bg-muted rounded">
                  {(() => {
                    const Icon = getPlatformIcon(decisionModal.platformContent.platform);
                    return (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getPlatformColor(decisionModal.platformContent.platform)}`}>
                        <Icon size={16} />
                      </div>
                    );
                  })()}
                  <span className="font-medium text-foreground">{decisionModal.platformContent.platform}</span>
                </div>

                {/* Account Selection */}
                {(decisionModal.decision === 'PUBLISH' || decisionModal.decision === 'PUBLISH_ON_SCHEDULE') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Accounts *
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableAccounts[decisionModal.platformContent.platform].map((account) => (
                        <label key={account.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccounts([...selectedAccounts, account.id]);
                              } else {
                                setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                              }
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-foreground">{account.display_name}</div>
                            <div className="text-xs text-muted-foreground">@{account.username}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {availableAccounts[decisionModal.platformContent.platform].length === 0 && (
                      <p className="text-sm text-muted-foreground">No accounts available for this platform</p>
                    )}
                  </div>
                )}

                {/* Schedule DateTime */}
                {decisionModal.decision === 'PUBLISH_ON_SCHEDULE' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Schedule Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-2 border border-border rounded bg-background text-foreground"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={closeDecisionModal}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitDecision}
                  disabled={
                    (decisionModal.decision === 'PUBLISH' || decisionModal.decision === 'PUBLISH_ON_SCHEDULE') && selectedAccounts.length === 0 ||
                    decisionModal.decision === 'PUBLISH_ON_SCHEDULE' && !scheduledDateTime
                  }
                >
                  Confirm {decisionModal.decision === 'PUBLISH' ? 'Publication' :
                    decisionModal.decision === 'PUBLISH_ON_SCHEDULE' ? 'Schedule' :
                      decisionModal.decision === 'POSTPONE' ? 'Postpone' : 'Decline'}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default SocialPlatformsPage;