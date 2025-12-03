import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Feed, FeedStats, FeedFormData, FeedFetchLog } from '@/types/feed';
import toast from 'react-hot-toast';

export function useFeeds() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState<FeedStats | null>(null);
    const [types, setTypes] = useState<string[]>([]);
    const [domains, setDomains] = useState<any[]>([]);

    // Filters and pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Logs state
    const [fetchLogs, setFetchLogs] = useState<FeedFetchLog[]>([]);
    const [feedFetchLogs, setFeedFetchLogs] = useState<FeedFetchLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [logsSearch, setLogsSearch] = useState('');
    const [logsStatus, setLogsStatus] = useState('all');

    const showMessage = useCallback((message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            toast.success(message);
            setSuccess(message);
            setError('');
            setTimeout(() => setSuccess(''), 5000);
        } else {
            toast.error(message);
            setError(message);
            setSuccess('');
            setTimeout(() => setError(''), 5000);
        }
    }, []);

    const fetchFeeds = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Record<string, any> = {};
            if (debouncedSearch) filters.search = debouncedSearch;
            if (typeFilter) filters.type = typeFilter;
            if (statusFilter !== 'all') filters.enabled = statusFilter === 'enabled';
            if (sortBy) filters.sort_by = sortBy;
            if (sortOrder) filters.sort_order = sortOrder;

            const response = await api.getFeeds(filters, page, 20);
            setFeeds(response.data);
            setTotalPages(response.pagination.total_pages);
        } catch (error: any) {
            console.error('Error fetching feeds:', error);
            if (error?.status === 401) {
                showMessage('Authentication failed - please log in again', 'error');
                localStorage.removeItem('authToken');
            } else {
                showMessage(error?.message || 'Failed to load feeds', 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, typeFilter, statusFilter, sortBy, sortOrder, page, showMessage]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.getFeedStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    const fetchTypes = useCallback(async () => {
        try {
            const response = await api.getFeedTypes();
            setTypes(response.data);
        } catch (error) {
            console.error('Failed to fetch types:', error);
            setTypes(['RSS', 'Atom', 'JSON']);
        }
    }, []);

    const fetchDomains = useCallback(async () => {
        try {
            const response = await api.getDomains();
            setDomains(response.data);
        } catch (error) {
            console.error('Failed to fetch domains:', error);
            setDomains([]);
        }
    }, []);

    const fetchLogsFromServer = useCallback(async () => {
        try {
            const response = await api.getFetchLogs();
            if (response.success && response.data) {
                const transformedLogs = response.data.map((log: any) => ({
                    id: log.id.toString(),
                    timestamp: new Date(log.timestamp),
                    user: log.user,
                    status: log.status,
                    request: {
                        fetchType: log.fetchType,
                        ids: log.ids === 'ALL' ? [] : log.ids
                    },
                    response: {
                        ...log.responseData,
                        webhookPayload: log.webhookPayload
                    },
                    error: log.error,
                    httpStatus: log.httpStatus,
                    message: log.message
                }));
                setFetchLogs(transformedLogs);
            }
        } catch (error) {
            console.error('Failed to fetch logs from server:', error);
        }
    }, []);

    const fetchFeedFetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const response = await api.getFetchLogs(logsPage, 20, logsStatus, logsSearch);
            if (response.success && response.data) {
                const transformedData = response.data.map((log: any) => ({
                    ...log,
                    status: log.status === 'SUCCESS' ? 'completed' :
                        log.status === 'FAILED' ? 'failed' :
                            log.status === 'RUNNING' ? 'pending' :
                                log.status.toLowerCase()
                }));
                setFeedFetchLogs(transformedData);
                if (response.pagination) {
                    setLogsTotalPages(response.pagination.total_pages);
                }
            }
        } catch (error) {
            console.error('Failed to fetch feed fetch logs:', error);
            showMessage('Failed to load feed fetch logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    }, [logsPage, logsStatus, logsSearch, showMessage]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Initial fetch
    useEffect(() => {
        fetchFeeds();
        fetchStats();
        fetchTypes();
        fetchDomains();
        fetchLogsFromServer();
    }, [fetchFeeds, fetchStats, fetchTypes, fetchDomains, fetchLogsFromServer]);

    return {
        feeds,
        loading,
        error,
        success,
        stats,
        types,
        domains,
        page,
        setPage,
        totalPages,
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        fetchLogs,
        feedFetchLogs,
        logsLoading,
        logsPage,
        setLogsPage,
        logsTotalPages,
        logsSearch,
        setLogsSearch,
        logsStatus,
        setLogsStatus,
        fetchFeedFetchLogs,
        fetchLogsFromServer,
        fetchFeeds,
        fetchStats,
        fetchTypes,
        showMessage,
        setError,
        setSuccess
    };
}
