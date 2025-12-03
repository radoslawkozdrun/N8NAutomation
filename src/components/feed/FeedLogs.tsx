import React, { useState } from 'react';
import {
    Search,
    RefreshCw,
    Eye,
    ChevronRight,
    ChevronDown,
    Trash2,
    Clock,
    User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FeedFetchLog } from '@/types/feed';

interface FeedLogsProps {
    feedFetchLogs: FeedFetchLog[];
    logsLoading: boolean;
    logsPage: number;
    setLogsPage: (page: number) => void;
    logsTotalPages: number;
    logsSearch: string;
    setLogsSearch: (value: string) => void;
    logsStatus: string;
    setLogsStatus: (value: string) => void;
    fetchLogs: FeedFetchLog[]; // These are the "Workflow calls" logs
    clearFetchLogs: () => void;
}

export const FeedLogs: React.FC<FeedLogsProps> = ({
    feedFetchLogs,
    logsLoading,
    logsPage,
    setLogsPage,
    logsTotalPages,
    logsSearch,
    setLogsSearch,
    logsStatus,
    setLogsStatus,
    fetchLogs,
    clearFetchLogs
}) => {
    const [isWorkflowCallsExpanded, setIsWorkflowCallsExpanded] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [expandedLogSections, setExpandedLogSections] = useState<Record<string, Set<string>>>({});

    const toggleLogSection = (logId: string, sectionName: string) => {
        setExpandedLogSections(prev => {
            const logSections = prev[logId] || new Set();
            const newLogSections = new Set(logSections);

            if (newLogSections.has(sectionName)) {
                newLogSections.delete(sectionName);
            } else {
                newLogSections.add(sectionName);
            }

            return {
                ...prev,
                [logId]: newLogSections
            };
        });
    };

    const isLogSectionExpanded = (logId: string, sectionName: string) => {
        return expandedLogSections[logId]?.has(sectionName) || false;
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        return statusClasses[status as keyof typeof statusClasses] || statusClasses.pending;
    };

    return (
        <div className="space-y-6">
            {/* Feed Fetch Logs Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Feed Fetch Logs</h3>
                    <p className="text-sm text-muted-foreground">View and manage logs of RSS feed data fetches.</p>

                    {/* Search and Filters */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search logs by ID or fetching number"
                                value={logsSearch}
                                onChange={(e) => setLogsSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <select
                            value={logsStatus}
                            onChange={(e) => setLogsStatus(e.target.value)}
                            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {logsLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
                        <span className="text-muted-foreground">Loading logs...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">ID</th>
                                    <th className="px-6 py-3 text-left font-medium">Fetching Number</th>
                                    <th className="px-6 py-3 text-left font-medium">Started At</th>
                                    <th className="px-6 py-3 text-left font-medium">Completed At</th>
                                    <th className="px-6 py-3 text-center font-medium">Status</th>
                                    <th className="px-6 py-3 text-right font-medium">Total</th>
                                    <th className="px-6 py-3 text-right font-medium">Valid</th>
                                    <th className="px-6 py-3 text-right font-medium">Invalid</th>
                                    <th className="px-6 py-3 text-center font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {feedFetchLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                            No fetch logs found
                                        </td>
                                    </tr>
                                ) : (
                                    feedFetchLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 font-mono text-xs">{log.id}</td>
                                            <td className="px-6 py-4">{log.fetching_number}</td>
                                            <td className="px-6 py-4">{log.started_at ? formatDate(log.started_at) : '-'}</td>
                                            <td className="px-6 py-4">{log.completed_at ? formatDate(log.completed_at) : '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                                                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">{log.total_feeds || 0}</td>
                                            <td className="px-6 py-4 text-right text-green-600">{log.valid_feeds || 0}</td>
                                            <td className="px-6 py-4 text-right text-red-600">{log.invalid_feeds || 0}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {logsTotalPages > 1 && (
                    <div className="p-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Page {logsPage} of {logsTotalPages}
                        </div>
                        <nav className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setLogsPage(Math.max(1, logsPage - 1))}
                                disabled={logsPage <= 1}
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                            </Button>

                            {Array.from({ length: Math.min(5, logsTotalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === logsPage ? "default" : "ghost"}
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setLogsPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            {logsTotalPages > 5 && (
                                <>
                                    <span className="text-muted-foreground">...</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setLogsPage(logsTotalPages)}
                                    >
                                        {logsTotalPages}
                                    </Button>
                                </>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setLogsPage(Math.min(logsTotalPages, logsPage + 1))}
                                disabled={logsPage >= logsTotalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Fetch Logs Section (Workflow Calls) */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsWorkflowCallsExpanded(!isWorkflowCallsExpanded)}
                            className="flex items-center text-lg font-medium text-foreground hover:text-foreground/80 transition-colors"
                        >
                            {isWorkflowCallsExpanded ? (
                                <ChevronDown className="w-5 h-5 mr-1" />
                            ) : (
                                <ChevronRight className="w-5 h-5 mr-1" />
                            )}
                            Run workflow calls
                        </button>
                    </div>
                    {fetchLogs.length > 0 && isWorkflowCallsExpanded && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFetchLogs}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                            title="Clear all fetch logs"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Clear Logs
                        </Button>
                    )}
                </div>
                {isWorkflowCallsExpanded && (
                    fetchLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No fetch operations logged yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {fetchLogs.slice(0, 10).map((log) => (
                                <div key={log.id} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full",
                                                log.status === 'success' ? 'bg-green-500' :
                                                    log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                            )} />
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">
                                                    {log.timestamp.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">{log.user}</span>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-1 rounded-md text-xs font-medium",
                                                getStatusBadge(log.status)
                                            )}>
                                                {log.status.toUpperCase()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newExpanded = new Set(expandedLogs);
                                                if (expandedLogs.has(log.id)) {
                                                    newExpanded.delete(log.id);
                                                } else {
                                                    newExpanded.add(log.id);
                                                }
                                                setExpandedLogs(newExpanded);
                                            }}
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            {expandedLogs.has(log.id) ?
                                                <ChevronDown className="w-4 h-4" /> :
                                                <ChevronRight className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>

                                    {expandedLogs.has(log.id) && (
                                        <div className="mt-3 pt-3 border-t border-border space-y-3">
                                            {/* Request to Backend Section */}
                                            <div>
                                                <button
                                                    onClick={() => toggleLogSection(log.id, 'request')}
                                                    className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                                                >
                                                    {isLogSectionExpanded(log.id, 'request') ? (
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 mr-1" />
                                                    )}
                                                    Request to Backend:
                                                </button>
                                                {isLogSectionExpanded(log.id, 'request') && (
                                                    <pre className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-orange-200 dark:border-orange-800">
                                                        {JSON.stringify(log.request, null, 2)}
                                                    </pre>
                                                )}
                                            </div>

                                            {/* Request to N8N Section */}
                                            {log.response && log.response.webhookPayload && (
                                                <div>
                                                    <button
                                                        onClick={() => toggleLogSection(log.id, 'webhook')}
                                                        className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                                                    >
                                                        {isLogSectionExpanded(log.id, 'webhook') ? (
                                                            <ChevronDown className="w-4 h-4 mr-1" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 mr-1" />
                                                        )}
                                                        Request to N8N:
                                                    </button>
                                                    {isLogSectionExpanded(log.id, 'webhook') && (
                                                        <pre className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-blue-200 dark:border-blue-800">
                                                            {JSON.stringify(log.response.webhookPayload, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}

                                            {/* Response Section */}
                                            {log.response && (
                                                <div>
                                                    <button
                                                        onClick={() => toggleLogSection(log.id, 'response')}
                                                        className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                                                    >
                                                        {isLogSectionExpanded(log.id, 'response') ? (
                                                            <ChevronDown className="w-4 h-4 mr-1" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 mr-1" />
                                                        )}
                                                        Response:
                                                    </button>
                                                    {isLogSectionExpanded(log.id, 'response') && (
                                                        <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-foreground overflow-x-auto border border-red-200 dark:border-red-800">
                                                            {JSON.stringify(log.response, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}

                                            {/* Error Section */}
                                            {log.error && (
                                                <div>
                                                    <button
                                                        onClick={() => toggleLogSection(log.id, 'error')}
                                                        className="flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors mb-2"
                                                    >
                                                        {isLogSectionExpanded(log.id, 'error') ? (
                                                            <ChevronDown className="w-4 h-4 mr-1" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 mr-1" />
                                                        )}
                                                        Error:
                                                    </button>
                                                    {isLogSectionExpanded(log.id, 'error') && (
                                                        <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700">
                                                            {log.error}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
