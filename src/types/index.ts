// Core article types based on database schema
export interface Article {
  id: number;
  title: string;
  author: string;
  link: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  subcategory: string;
  tags: string[];
  priority: Priority;
  target_audience: TargetAudience;
  relevance_score: number;
  novelty_score: number;
  viral_score: number;
  value_score: number;
  final_score: number;
  key_takeaways: string[];
  reasoning: string;
  status: ArticleStatus;
  created_date: string;
}

export type ArticleCategory = 
  | 'AI_ML'
  | 'WEB_DEV'
  | 'MOBILE_DEV'
  | 'DATA_SCIENCE'
  | 'DEVOPS'
  | 'SECURITY'
  | 'CLOUD'
  | 'BLOCKCHAIN'
  | 'IOT'
  | 'OTHER';

export type Priority = 
  | 'P0_BREAKING'
  | 'P1_TRENDING'
  | 'P2_TIMELY'
  | 'P3_EVERGREEN'
  | 'P4_FILLER';

export type TargetAudience = 
  | 'developers'
  | 'architects'
  | 'managers'
  | 'beginners'
  | 'experts'
  | 'mixed';

export type ArticleStatus = 
  | 'NEW'
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'NEEDS_MORE'
  | 'RESEARCH_DONE';

export interface ReviewDecision {
  action: 'accept' | 'reject';
  notes?: string;
  justification?: string;
}

export interface BulkUpdateRequest {
  articleIds: number[];
  action: 'accept' | 'reject';
  notes?: string;
}

export interface ResearchMaterial {
  id: number;
  search_id: string;
  source_url: string;
  research_type: string;
  content: string;
  author: string;
  title: string;
  publication_date: string;
  created_at: string;
  query: string;
}

export type UserRole = 'ADMIN' | 'USER' | 'DEMO';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface ArticleFilters {
  status?: string;
  category?: ArticleCategory;
  priority?: Priority;
  target_audience?: TargetAudience;
  score_min?: number;
  score_max?: number;
  search?: string;
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}


// UI State types
export interface UIState {
  darkMode: boolean;
  selectedArticles: number[];
  viewMode: 'cards' | 'table';
  currentFilter: ArticleFilters;
  sortBy: 'final_score' | 'created_date' | 'priority';
  sortOrder: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  handler: () => void;
}

// View types
export type ViewType =
  | 'all-articles'
  | 'account'
  | 'feeds'
  | 'domains'
  | 'new-dashboard'
  | 'new-social-media-accounts'
  | 'dashboard'
  | 'article-list-page'
  | 'article-details'
  | 'rss-feeds'
  | 'user-management'
  | 'content-adaptation'
  | 'config-properties'
  | 'master-content'
  | 'master-content-edit'
  | 'social-platforms';

// n8n Types
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  nodes: N8nNode[];
  connections: any;
  settings?: any;
  staticData?: any;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  position: [number, number];
  credentials?: any;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

// Config Property Types
export interface ConfigProperty {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
  data_type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  is_encrypted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface ConfigPropertyFilters {
  search?: string;
  data_type?: string;
  is_active?: boolean;
  is_encrypted?: boolean;
}

export interface CreateConfigPropertyRequest {
  key: string;
  value?: string;
  description?: string;
  data_type?: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  is_encrypted?: boolean;
  is_active?: boolean;
}

export interface UpdateConfigPropertyRequest {
  key?: string;
  value?: string;
  description?: string;
  data_type?: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  is_encrypted?: boolean;
  is_active?: boolean;
}

// Master Content Types
export interface MasterContent {
  id: number;
  article_id: number;
  title: string;
  content: string;
  summary: string;
  key_points: string[];
  tags: string[];
  category: ArticleCategory;
  target_audience: TargetAudience;
  tone: ContentTone;
  research_data?: ResearchData[];
  status: MasterContentStatus;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number;
  article?: Article; // Populated article details
}

export type MasterContentStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING';

export type ContentTone = 
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'authoritative'
  | 'educational'
  | 'conversational';

export interface ResearchData {
  id: number;
  source: string;
  url: string;
  title: string;
  summary: string;
  relevance_score: number;
  created_at: string;
}

export interface MasterContentFilters {
  status?: MasterContentStatus;
  category?: ArticleCategory;
  target_audience?: TargetAudience;
  tone?: ContentTone;
  search?: string;
  created_by?: number;
  date_from?: string;
  date_to?: string;
}

// Social Platform Content Types
export interface PlatformContent {
  id: number;
  master_content_id: number;
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  mentions: string[];
  media_urls?: string[];
  scheduled_for?: string;
  status: PlatformContentStatus;
  decision: PublishDecision;
  target_accounts: number[]; // IDs of social media accounts
  created_at: string;
  updated_at: string;
  published_at?: string;
  master_content?: MasterContent;
}

export type SocialPlatform = 
  | 'TWITTER'
  | 'LINKEDIN'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TIKTOK';

export type PlatformContentStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'POSTPONED'
  | 'DECLINED';

export type PublishDecision = 
  | 'PUBLISH'
  | 'POSTPONE'
  | 'DECLINE'
  | 'PUBLISH_ON_SCHEDULE'
  | 'PENDING';

export interface PublishDecisionData {
  decision: PublishDecision;
  scheduled_for?: string; // For PUBLISH_ON_SCHEDULE
  target_accounts: number[]; // Selected social media account IDs
  notes?: string;
  user_id: number;
}

export interface SocialMediaAccount {
  id: number;
  platform: SocialPlatform;
  username: string;
  display_name: string;
  is_active: boolean;
  api_credentials?: any;
  created_at: string;
  updated_at: string;
}

export interface PlatformContentFilters {
  platform?: SocialPlatform;
  status?: PlatformContentStatus;
  decision?: PublishDecision;
  master_content_id?: number;
  scheduled_from?: string;
  scheduled_to?: string;
  search?: string;
}
