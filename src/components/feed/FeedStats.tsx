import React from 'react';
import { Rss, CheckCircle } from 'lucide-react';
import { FeedStats as FeedStatsType } from '@/types/feed';

interface FeedStatsProps {
    stats: FeedStatsType | null;
}

export const FeedStats: React.FC<FeedStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Rss className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{stats?.overview?.total_feeds || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Feeds</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{stats?.overview?.enabled_feeds || 0}</p>
                        <p className="text-sm text-muted-foreground">Enabled Feeds</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
