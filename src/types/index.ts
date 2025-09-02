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
  action: 'accept' | 'reject' | 'needs_more';
  notes?: string;
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