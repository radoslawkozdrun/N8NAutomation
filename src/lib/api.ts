import { Article, ReviewDecision, BulkUpdateRequest, ArticleFilters, PaginatedResponse, ApiResponse, ResearchMaterial, User, UserFilters, CreateUserRequest, UpdateUserRequest, MasterContent, MasterContentFilters, PlatformContent, PlatformContentFilters, PublishDecisionData, SocialPlatform, SocialMediaAccount } from '../types';

// Dynamic API URL detection
const getApiBaseUrl = () => {
  // If VITE_API_URL is set during build, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For production: if serving from same domain, use relative URL
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }

  // For development: use full localhost URL
  return 'http://localhost:8002/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token if available
  const token = localStorage.getItem('authToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
  }
}

export const api = {
  // Generic HTTP methods
  post: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async <T = any>(endpoint: string): Promise<T> => {
    return request<T>(endpoint);
  },

  put: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },

  // Articles
  getArticles: async (
    filters: ArticleFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Article>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });


    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }

    return request<PaginatedResponse<Article>>(`/articles?${params}`);
  },

  getArticle: async (id: number): Promise<ApiResponse<Article>> => {
    return request<ApiResponse<Article>>(`/articles/${id}`);
  },

  getAllArticles: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Article>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: '', // Empty status to get all articles regardless of status
    });

    return request<PaginatedResponse<Article>>(`/articles?${params}`);
  },

  updateArticleStatus: async (
    id: number,
    decision: ReviewDecision
  ): Promise<ApiResponse<Article>> => {
    return request<ApiResponse<Article>>(`/articles/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  },

  bulkUpdateArticles: async (
    requestData: BulkUpdateRequest
  ): Promise<ApiResponse<{ updated_count: number }>> => {
    return request<ApiResponse<{ updated_count: number }>>('/articles/bulk-update', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  deleteArticle: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  bulkDeleteArticles: async (
    articleIds: number[]
  ): Promise<ApiResponse<{ deleted_count: number; not_found_count: number; not_found_ids: number[] }>> => {
    return request<ApiResponse<{ deleted_count: number; not_found_count: number; not_found_ids: number[] }>>('/articles/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ articleIds }),
    });
  },


  // Search and filters
  searchArticles: async (
    query: string,
    filters: ArticleFilters = {}
  ): Promise<PaginatedResponse<Article>> => {
    return api.getArticles({ ...filters, search: query });
  },

  getAvailableTags: async (): Promise<ApiResponse<string[]>> => {
    return request<ApiResponse<string[]>>('/articles/tags');
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return request<ApiResponse<string[]>>('/articles/categories');
  },

  // Research materials
  getResearchMaterials: async (articleId: number): Promise<ApiResponse<ResearchMaterial[]>> => {
    return request<ApiResponse<ResearchMaterial[]>>(`/articles/${articleId}/research`);
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return request<ApiResponse<{ status: string; timestamp: string }>>('/health');
  },

  // Auth
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> => {
    return request<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.email, // Backend expects username field but we send email
        password: credentials.password
      }),
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return request<ApiResponse<User>>('/auth/profile');
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>('/auth/logout', {
      method: 'POST'
    });
  },

  validateToken: async (): Promise<ApiResponse<{ valid: boolean; user: User }>> => {
    return request<ApiResponse<{ valid: boolean; user: User }>>('/auth/validate');
  },

  // User management (Admin only)
  getUsers: async (
    filters: UserFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });

    return request<PaginatedResponse<User>>(`/user?${params}`);
  },

  getUser: async (id: number): Promise<ApiResponse<User>> => {
    return request<ApiResponse<User>>(`/user/${id}`);
  },

  createUser: async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
    return request<ApiResponse<User>>('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: number, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
    return request<ApiResponse<User>>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  toggleUserStatus: async (id: number): Promise<ApiResponse<User>> => {
    return request<ApiResponse<User>>(`/user/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  deleteUser: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>(`/user/${id}`, {
      method: 'DELETE',
    });
  },

  getUserStats: async (): Promise<ApiResponse<{
    overview: {
      total_users: number;
      active_users: number;
      inactive_users: number;
      admin_users: number;
      regular_users: number;
      demo_users: number;
      recent_logins: number;
    };
    by_role: Array<{
      role: string;
      count: number;
      active_count: number;
    }>;
  }>> => {
    return request<ApiResponse<any>>('/user/meta/stats');
  },

  // Dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<{
    total_pending: number;
    average_score: number;
    category_distribution: Record<string, number>;
    priority_distribution: Record<string, number>;
    recent_activity: Array<{
      id: string;
      action: string;
      article_title: string;
      timestamp: string;
      user: string;
    }>;
  }>> => {
    return request<ApiResponse<any>>('/dashboard/stats');
  },

  // Feed management
  getFeeds: async (filters: Record<string, any> = {}, page = 1, limit = 20): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    });

    return request<any>(`/feeds?${params}`);
  },

  getFeedStats: async (): Promise<any> => {
    return request<any>('/feeds/meta/stats');
  },

  getFeedTypes: async (): Promise<any> => {
    return request<any>('/feeds/meta/types');
  },

  createFeed: async (feedData: any): Promise<any> => {
    return request<any>('/feeds', {
      method: 'POST',
      body: JSON.stringify(feedData),
    });
  },

  updateFeed: async (id: number, feedData: any): Promise<any> => {
    return request<any>(`/feeds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feedData),
    });
  },

  toggleFeed: async (id: number): Promise<any> => {
    return request<any>(`/feeds/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  deleteFeed: async (id: number): Promise<any> => {
    return request<any>(`/feeds/${id}`, {
      method: 'DELETE',
    });
  },

  // Domain management
  getDomains: async (filters: Record<string, any> = {}, page = 1, limit = 20): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    });

    return request<any>(`/domains?${params}`);
  },

  getDomainStats: async (): Promise<any> => {
    return request<any>('/domains/meta/stats');
  },

  createDomain: async (domainData: any): Promise<any> => {
    return request<any>('/domains', {
      method: 'POST',
      body: JSON.stringify(domainData),
    });
  },

  updateDomain: async (id: number, domainData: any): Promise<any> => {
    return request<any>(`/domains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(domainData),
    });
  },

  toggleDomain: async (id: number): Promise<any> => {
    return request<any>(`/domains/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  deleteDomain: async (id: number): Promise<any> => {
    return request<any>(`/domains/${id}`, {
      method: 'DELETE',
    });
  },

  // Fetch articles logs
  getFetchLogs: async (page = 1, limit = 20, status?: string, search?: string): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    if (search) {
      params.append('search', search);
    }

    return request<ApiResponse<any[]>>(`/feeds/fetch-logs?${params.toString()}`);
  },

  clearFetchLogs: async (): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>('/feeds/fetch-logs', {
      method: 'DELETE',
    });
  },

  // Fetch articles from N8N webhook
  fetchArticles: async (payload: { fetchType: string; ids?: number[] }): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>('/feeds/fetch-articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Social Media Account Management
  getSocialMediaAccounts: async (
    filters: Record<string, any> = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '' && value !== 'all')
      ),
    });

    return request<PaginatedResponse<any>>(`/social-media?${params}`);
  },

  getSocialMediaAccount: async (id: number): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>(`/social-media/${id}`);
  },

  createSocialMediaAccount: async (accountData: any): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>('/social-media', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  updateSocialMediaAccountStatus: async (id: number, statusData: any): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>(`/social-media/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },

  deleteSocialMediaAccount: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>(`/social-media/${id}`, {
      method: 'DELETE',
    });
  },

  getSocialMediaStats: async (): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>('/social-media/meta/stats');
  },

  // n8n API Integration (via backend proxy)
  n8n: {
    // Get all workflows
    getWorkflows: async (): Promise<any[]> => {
      const response = await request<ApiResponse<any[]>>('/n8n/workflows');
      return response.data;
    },

    // Get workflow by ID
    getWorkflow: async (id: string): Promise<any> => {
      const response = await request<ApiResponse<any>>(`/n8n/workflows/${id}`);
      return response.data;
    },

    // Execute workflow
    executeWorkflow: async (id: string, data?: any): Promise<any> => {
      const response = await request<ApiResponse<any>>(`/n8n/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
      return response.data;
    },

    // Get workflow executions
    getWorkflowExecutions: async (workflowId?: string, status?: string, limit?: number): Promise<any[]> => {
      const params = new URLSearchParams();
      if (workflowId) params.append('workflowId', workflowId);
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit.toString());

      const endpoint = `/n8n/executions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await request<ApiResponse<any[]>>(endpoint);
      return response.data;
    },

    // Get execution details
    getExecution: async (id: string): Promise<any> => {
      const response = await request<ApiResponse<any>>(`/n8n/executions/${id}`);
      return response.data;
    },

    // Health check for n8n connection
    healthCheck: async (): Promise<any> => {
      const response = await request<ApiResponse<any>>('/n8n/health');
      return response.data;
    },
  },

  // Config Properties API
  getConfigProperties: async (filters: any = {}, page: number = 1, limit: number = 20): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.data_type && { data_type: filters.data_type }),
      ...(filters.is_active !== undefined && { is_active: filters.is_active.toString() }),
      ...(filters.is_encrypted !== undefined && { is_encrypted: filters.is_encrypted.toString() }),
    });

    return request<ApiResponse<any>>(`/config-properties?${params}`);
  },

  getConfigProperty: async (id: number): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>(`/config-properties/${id}`);
  },

  createConfigProperty: async (data: any): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>('/config-properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateConfigProperty: async (id: number, data: any): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>(`/config-properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteConfigProperty: async (id: number): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>(`/config-properties/${id}`, {
      method: 'DELETE',
    });
  },

  bulkToggleConfigProperties: async (ids: number[], is_active: boolean): Promise<ApiResponse<any>> => {
    return request<ApiResponse<any>>('/config-properties/bulk/toggle-active', {
      method: 'PATCH',
      body: JSON.stringify({ ids, is_active }),
    });
  },

  // Master Content API
  getMasterContents: async (
    filters: MasterContentFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<MasterContent>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });

    return request<PaginatedResponse<MasterContent>>(`/master-content?${params}`);
  },

  getMasterContent: async (id: number): Promise<ApiResponse<MasterContent>> => {
    return request<ApiResponse<MasterContent>>(`/master-content/${id}`);
  },

  createMasterContent: async (articleId: number): Promise<ApiResponse<MasterContent>> => {
    return request<ApiResponse<MasterContent>>('/master-content', {
      method: 'POST',
      body: JSON.stringify({ article_id: articleId })
    });
  },

  updateMasterContent: async (id: number, data: Partial<MasterContent>): Promise<ApiResponse<MasterContent>> => {
    return request<ApiResponse<MasterContent>>(`/master-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteMasterContent: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>(`/master-content/${id}`, {
      method: 'DELETE'
    });
  },

  approveMasterContent: async (id: number): Promise<ApiResponse<MasterContent>> => {
    return request<ApiResponse<MasterContent>>(`/master-content/${id}/approve`, {
      method: 'PATCH'
    });
  },

  rejectMasterContent: async (id: number, reason?: string): Promise<ApiResponse<MasterContent>> => {
    return request<ApiResponse<MasterContent>>(`/master-content/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  },

  // Platform Content API
  getPlatformContents: async (
    filters: PlatformContentFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<PlatformContent>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });

    return request<PaginatedResponse<PlatformContent>>(`/platform-content?${params}`);
  },

  getPlatformContent: async (id: number): Promise<ApiResponse<PlatformContent>> => {
    return request<ApiResponse<PlatformContent>>(`/platform-content/${id}`);
  },

  createPlatformContent: async (masterContentId: number, platform: SocialPlatform): Promise<ApiResponse<PlatformContent>> => {
    return request<ApiResponse<PlatformContent>>('/platform-content', {
      method: 'POST',
      body: JSON.stringify({
        master_content_id: masterContentId,
        platform
      })
    });
  },

  updatePlatformContent: async (id: number, data: Partial<PlatformContent>): Promise<ApiResponse<PlatformContent>> => {
    return request<ApiResponse<PlatformContent>>(`/platform-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deletePlatformContent: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return request<ApiResponse<{ message: string }>>(`/platform-content/${id}`, {
      method: 'DELETE'
    });
  },

  // Platform Content Decision Actions
  makePublishDecision: async (id: number, decisionData: PublishDecisionData): Promise<ApiResponse<PlatformContent>> => {
    return request<ApiResponse<PlatformContent>>(`/platform-content/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(decisionData)
    });
  },

  // Helper methods to make specific decisions
  publishNow: async (id: number, targetAccounts: number[]): Promise<ApiResponse<PlatformContent>> => {
    return api.makePublishDecision(id, {
      decision: 'PUBLISH',
      target_accounts: targetAccounts,
      user_id: 0 // Will be replaced with current user ID from token
    });
  },

  schedulePublish: async (id: number, targetAccounts: number[], scheduledFor: string): Promise<ApiResponse<PlatformContent>> => {
    return api.makePublishDecision(id, {
      decision: 'PUBLISH_ON_SCHEDULE',
      target_accounts: targetAccounts,
      scheduled_for: scheduledFor,
      user_id: 0 // Will be replaced with current user ID from token
    });
  },

  postponeDecision: async (id: number, notes?: string): Promise<ApiResponse<PlatformContent>> => {
    return api.makePublishDecision(id, {
      decision: 'POSTPONE',
      target_accounts: [],
      notes,
      user_id: 0 // Will be replaced with current user ID from token
    });
  },

  declineContent: async (id: number, notes?: string): Promise<ApiResponse<PlatformContent>> => {
    return api.makePublishDecision(id, {
      decision: 'DECLINE',
      target_accounts: [],
      notes,
      user_id: 0 // Will be replaced with current user ID from token
    });
  },

  // Get available social media accounts by platform
  getSocialMediaAccountsByPlatform: async (platform: SocialPlatform): Promise<ApiResponse<SocialMediaAccount[]>> => {
    return request<ApiResponse<SocialMediaAccount[]>>(`/social-media/platform/${platform}`);
  },

  // Generate platform content from master content using AI
  generatePlatformContent: async (masterContentId: number, platform: SocialPlatform): Promise<ApiResponse<PlatformContent>> => {
    return request<ApiResponse<PlatformContent>>(`/master-content/${masterContentId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ platform })
    });
  },
};

export { ApiError };