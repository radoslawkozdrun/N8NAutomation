import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { FeedStats } from './FeedStats';
import { FeedStats as FeedStatsType } from '@/types/feed';

describe('FeedStats', () => {
    const mockStats: FeedStatsType = {
        overview: {
            total_feeds: 10,
            enabled_feeds: 8,
            disabled_feeds: 2,
            checked_feeds: 7,
            error_feeds: 1,
            avg_error_count: 0.5
        },
        types: [
            { type: 'RSS', count: 5, enabled_count: 4 },
            { type: 'Atom', count: 3, enabled_count: 2 },
            { type: 'JSON', count: 2, enabled_count: 2 }
        ]
    };

    it('renders total feeds count', () => {
        render(<FeedStats stats={mockStats} />);
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Total Feeds')).toBeInTheDocument();
    });

    it('renders enabled feeds count', () => {
        render(<FeedStats stats={mockStats} />);
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('Enabled Feeds')).toBeInTheDocument();
    });

    it('renders 0 when stats are null', () => {
        render(<FeedStats stats={null} />);
        const zeros = screen.getAllByText('0');
        expect(zeros).toHaveLength(2);
    });

    it('renders 0 when stats overview is undefined', () => {
        const emptyStats: FeedStatsType = {
            overview: {
                total_feeds: 0,
                enabled_feeds: 0,
                disabled_feeds: 0,
                checked_feeds: 0,
                error_feeds: 0,
                avg_error_count: 0
            },
            types: []
        };
        render(<FeedStats stats={emptyStats} />);
        const zeros = screen.getAllByText('0');
        expect(zeros).toHaveLength(2);
    });
});
