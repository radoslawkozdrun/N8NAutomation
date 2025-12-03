import { memo } from 'react';
import { X } from 'lucide-react';
import { Feed, FeedFormData } from '@/types/feed';

interface FeedModalsProps {
    showAddModal: boolean;
    showEditModal: boolean;
    editingFeed: Feed | null;
    closeModals: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    formData: FeedFormData;
    setFormData: (data: FeedFormData) => void;
    domains: any[];
}

export const FeedModals = memo<FeedModalsProps>(({
    showAddModal,
    showEditModal,
    editingFeed,
    closeModals,
    handleSubmit,
    formData,
    setFormData,
    domains
}) => {
    if (!showAddModal && !showEditModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                        {editingFeed ? 'Edit Feed' : 'Add New Feed'}
                    </h3>
                    <button
                        onClick={closeModals}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Feed display name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            URL *
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="https://example.com/feed.xml"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Domain *
                        </label>
                        <select
                            required
                            value={formData.domain_id}
                            onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Select a domain</option>
                            {domains.map(domain => (
                                <option key={domain.id} value={domain.id}>
                                    {domain.domain_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Type
                        </label>
                        <input
                            type="text"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="e.g., Technology, News"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Brief description of this feed"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="enabled"
                            checked={formData.enabled}
                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <label htmlFor="enabled" className="ml-2 block text-sm text-foreground">
                            Enable this feed
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={closeModals}
                            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                        >
                            {editingFeed ? 'Update Feed' : 'Add Feed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

FeedModals.displayName = 'FeedModals';

