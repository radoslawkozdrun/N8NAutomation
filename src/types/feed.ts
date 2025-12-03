export interface Feed {
    id: number;
    name: string;
    url: string;
    description: string;
    type: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
    last_checked: string | null;
    error_count: number;
    last_error: string | null;
    domain_id: number | null;
    domain_name: string | null;
    domain_code: string | null;
}

export interface FeedStats {
    overview: {
        total_feeds: number;
        enabled_feeds: number;
        disabled_feeds: number;
        checked_feeds: number;
        error_feeds: number;
        avg_error_count: number;
    };
    types: Array<{
        type: string;
        count: number;
        enabled_count: number;
    }>;
}

export interface FeedFilters {
    search?: string;
    type?: string;
    enabled?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface FeedFormData {
    name: string;
    url: string;
    description: string;
    type: string;
    enabled: boolean;
    domain_id: string | number;
}

export interface FeedFetchLog {
    id: string;
    timestamp: Date;
    user: string;
    status: 'success' | 'error' | 'pending' | 'completed' | 'failed';
    request: {
        fetchType: string;
        ids: number[];
    };
    response: any;
    error?: string;
    httpStatus?: number;
    message?: string;
    fetching_number?: string;
    started_at?: string;
    completed_at?: string;
    total_feeds?: number;
    valid_feeds?: number;
    invalid_feeds?: number;
}
