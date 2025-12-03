import React from 'react';
import {
    Search,
    X,
    Rss,
    Plus,
    Download,
    Power,
    Trash2,
    ExternalLink,
    Edit2,
    PowerOff,
    CheckCircle,
    XCircle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Feed } from '@/types/feed';

interface FeedTableProps {
    feeds: Feed[];
    loading: boolean;
    search: string;
    setSearch: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: 'all' | 'enabled' | 'disabled') => void;
    types: string[];
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    handleSort: (field: string) => void;
    selectedFeedRows: Set<number>;
    selectAllFeeds: boolean;
    handleSelectAllFeeds: (checked: boolean) => void;
    handleSelectFeedRow: (feedId: number, checked: boolean) => void;
    handleBulkFetchFeeds: () => void;
    handleBulkToggleFeeds: (enable: boolean) => void;
    handleBulkDeleteFeeds: () => void;
    fetchingArticles: boolean;
    toggleFeed: (id: number) => void;
    deleteFeed: (id: number, name: string) => void;
    openEditModal: (feed: Feed) => void;
    setShowAddModal: (show: boolean) => void;
    clearFilters: () => void;
}

export const FeedTable: React.FC<FeedTableProps> = ({
    feeds,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    types,
    page,
    setPage,
    totalPages,
    sortBy,
    sortOrder,
    handleSort,
    selectedFeedRows,
    selectAllFeeds,
    handleSelectAllFeeds,
    handleSelectFeedRow,
    handleBulkFetchFeeds,
    handleBulkToggleFeeds,
    handleBulkDeleteFeeds,
    fetchingArticles,
    toggleFeed,
    deleteFeed,
    openEditModal,
    setShowAddModal,
    clearFilters
}) => {
    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortOrder === 'asc' ?
            <ArrowUp className="w-4 h-4 text-blue-500" /> :
            <ArrowDown className="w-4 h-4 text-blue-500" />;
    };

    const getStatusBadgeColor = (enabled: boolean, errorCount: number) => {
        if (!enabled) {
            return 'text-muted-foreground bg-muted border-border';
        }
        if (errorCount > 0) {
            return 'text-warning bg-warning/10 border-warning/20';
        }
        return 'text-success bg-success/10 border-success/20';
    };

    const getStatusText = (enabled: boolean, errorCount: number) => {
        if (!enabled) return 'Disabled';
        if (errorCount > 0) return 'Errors';
        return 'Active';
    };

    return (
        <>
            {/* Filters */}
            <div className="mb-6 bg-card border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search feeds..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-3 py-2 w-full border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Types</option>
                            {types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Actions
                        </label>
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="w-full h-[42px] py-2"
                        >
                            <X className="w-3.5 h-3.5 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feeds Table */}
            <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
                {loading && feeds.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
                        <span className="text-muted-foreground">Loading feeds...</span>
                    </div>
                ) : feeds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Rss className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No feeds found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first RSS feed source.
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Feed
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Bulk Actions Bar */}
                        {selectedFeedRows.size > 0 && (
                            <div className="px-4 py-3 bg-primary/5 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-foreground font-medium">
                                            {selectedFeedRows.size} feed{selectedFeedRows.size !== 1 ? 's' : ''} selected
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSelectAllFeeds(false)}
                                            className="h-8"
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleBulkFetchFeeds}
                                            disabled={fetchingArticles}
                                            className="h-8 bg-green-600 hover:bg-green-700"
                                        >
                                            <Download className={cn('w-3 h-3 mr-1', fetchingArticles && 'animate-spin')} />
                                            Fetch Selected
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleBulkToggleFeeds(true)}
                                            className="h-8 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Power className="w-3 h-3 mr-1" />
                                            Toggle Selected
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBulkDeleteFeeds}
                                            className="h-8"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Delete Selected
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectAllFeeds}
                                                onChange={(e) => handleSelectAllFeeds(e.target.checked)}
                                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                            />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Feed</span>
                                                {getSortIcon('name')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                                            onClick={() => handleSort('type')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Type</span>
                                                {getSortIcon('type')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                                            onClick={() => handleSort('domain_name')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Domain</span>
                                                {getSortIcon('domain_name')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 select-none"
                                            onClick={() => handleSort('enabled')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Status</span>
                                                {getSortIcon('enabled')}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {feeds.map((feed) => (
                                        <tr key={feed.id} className={cn(
                                            "hover:bg-muted/50",
                                            !feed.enabled && "bg-gray-100/50 dark:bg-gray-800/50 opacity-60"
                                        )}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFeedRows.has(feed.id)}
                                                    onChange={(e) => handleSelectFeedRow(feed.id, e.target.checked)}
                                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate",
                                                        feed.enabled ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {feed.name}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs truncate",
                                                        feed.enabled ? "text-muted-foreground" : "text-muted-foreground/60"
                                                    )}>
                                                        {feed.url}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {feed.type && (
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                                                        feed.enabled
                                                            ? "bg-primary/10 text-primary border-primary/20"
                                                            : "bg-muted/50 text-muted-foreground border-muted-foreground/20"
                                                    )}>
                                                        {feed.type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {feed.domain_name ? (
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                                                        feed.enabled
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                                                            : "bg-muted/50 text-muted-foreground border-muted-foreground/20"
                                                    )}>
                                                        {feed.domain_name}
                                                    </span>
                                                ) : (
                                                    <span className={cn(
                                                        "text-sm",
                                                        feed.enabled ? "text-muted-foreground" : "text-muted-foreground/60"
                                                    )}>No domain</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(feed.enabled, feed.error_count)}`}>
                                                    {feed.enabled ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {getStatusText(feed.enabled, feed.error_count)}
                                                </span>
                                                {feed.error_count > 0 && (
                                                    <div className="text-xs text-error mt-1">
                                                        {feed.error_count} errors
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleFeed(feed.id)}
                                                        className={cn(
                                                            'h-8 w-8 p-0',
                                                            feed.enabled ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'
                                                        )}
                                                        title={feed.enabled ? 'Disable feed' : 'Enable feed'}
                                                    >
                                                        {feed.enabled ? (
                                                            <Power className="w-4 h-4" />
                                                        ) : (
                                                            <PowerOff className="w-4 h-4" />
                                                        )}
                                                    </Button>

                                                    <a
                                                        href={feed.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:text-blue-700 hover:bg-muted transition-colors"
                                                        title="Open feed URL in new tab"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(feed)}
                                                        className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                                                        title="Edit this feed"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteFeed(feed.id, feed.name)}
                                                        className="h-8 w-8 p-0 text-error hover:text-error/80"
                                                        title="Delete feed"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
