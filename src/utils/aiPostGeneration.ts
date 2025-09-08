// AI Post Generation utilities
// Mock implementation for demonstration purposes

export interface ArticleContent {
  title: string;
  content: string;
  url?: string;
  source?: string;
}

export interface SocialMediaPost {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram';
  content: string;
  hashtags: string[];
  scheduledTime?: Date;
}

export interface ArticleAnalysis {
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  readabilityScore: number;
  suggestedHashtags: string[];
}

// Mock function to generate social media posts from article content
export async function generateSocialMediaPost(
  article: ArticleContent,
  platform: SocialMediaPost['platform'],
  options?: {
    tone?: 'professional' | 'casual' | 'engaging';
    includeHashtags?: boolean;
    maxLength?: number;
  }
): Promise<SocialMediaPost> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const toneVariations = {
    professional: "📊 ",
    casual: "Hey! 👋 ",
    engaging: "🔥 "
  };

  const tone = options?.tone || 'engaging';
  const prefix = toneVariations[tone];

  // Generate mock content based on article title
  const content = `${prefix}${article.title.substring(0, 100)}${article.title.length > 100 ? '...' : ''}`;
  
  // Generate mock hashtags
  const hashtags = options?.includeHashtags !== false ? [
    '#tech',
    '#automation',
    '#productivity',
    '#innovation'
  ] : [];

  return {
    platform,
    content,
    hashtags
  };
}

// Mock function to analyze article content
export async function analyzeArticleContent(article: ArticleContent): Promise<ArticleAnalysis> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate mock analysis
  const keyPoints = [
    "Main topic focuses on automation and efficiency",
    "Discusses implementation strategies",
    "Provides practical examples and use cases",
    "Includes technical considerations"
  ];

  const topics = article.content ? 
    article.content.split(' ')
      .filter(word => word.length > 5)
      .slice(0, 5)
      .map(word => word.toLowerCase()) :
    ['automation', 'technology', 'productivity'];

  const suggestedHashtags = [
    '#automation',
    '#tech',
    '#productivity',
    '#innovation',
    '#workflow'
  ];

  return {
    keyPoints,
    sentiment: 'positive',
    topics,
    readabilityScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
    suggestedHashtags
  };
}

// Helper function to optimize post content for specific platforms
export function optimizePostForPlatform(
  content: string,
  platform: SocialMediaPost['platform']
): string {
  const platformLimits = {
    twitter: 280,
    facebook: 500,
    linkedin: 700,
    instagram: 300
  };

  const limit = platformLimits[platform];
  
  if (content.length <= limit) {
    return content;
  }

  // Truncate and add ellipsis
  return content.substring(0, limit - 3) + '...';
}

// Helper function to suggest optimal posting times
export function suggestPostingTimes(platform: SocialMediaPost['platform']): Date[] {
  const now = new Date();
  const suggestions: Date[] = [];

  // Mock optimal times based on platform
  const optimalHours = {
    twitter: [9, 12, 15, 18],
    facebook: [10, 13, 16, 19],
    linkedin: [8, 11, 14, 17],
    instagram: [11, 14, 17, 20]
  };

  const hours = optimalHours[platform];
  
  hours.forEach(hour => {
    const suggestionTime = new Date(now);
    suggestionTime.setHours(hour, 0, 0, 0);
    
    // If the time has passed today, suggest for tomorrow
    if (suggestionTime <= now) {
      suggestionTime.setDate(suggestionTime.getDate() + 1);
    }
    
    suggestions.push(suggestionTime);
  });

  return suggestions;
}