import { Article, ReviewDecision, BulkUpdateRequest, ArticleFilters, PaginatedResponse, ApiResponse, ResearchMaterial, User } from '@/types';

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
};

export { ApiError };