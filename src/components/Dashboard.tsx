import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardStats, ArticleCategory, Priority } from '@/types';
import { 
  getCategoryLabel, 
  getCategoryBadgeColor, 
  getPriorityLabel, 
  getPriorityBadgeColor,
  formatRelativeDate 
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DashboardProps {
  onViewArticles: () => void;
}

export function Dashboard({ onViewArticles }: DashboardProps) {
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <Button variant="danger" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const dashboardData = stats?.data;

  if (!dashboardData) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No dashboard data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Article Review Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage RSS articles with AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            loading={isRefetching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onViewArticles}>
            Review Articles
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={dashboardData.total_pending}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          description={`${dashboardData.total_pending} articles waiting`}
          trend={{ value: 12, direction: 'up' }}
        />
        
        <StatCard
          title="Average Score"
          value={`${Math.round(dashboardData.average_score)}/100`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="green"
          description="Overall quality rating"
          trend={{ value: 5, direction: 'up' }}
        />
        
        <StatCard
          title="Top Category"
          value={getTopCategory(dashboardData.category_distribution)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          description="Most active this week"
        />
        
        <StatCard
          title="High Priority"
          value={getHighPriorityCount(dashboardData.priority_distribution)}
          icon={<Users className="w-5 h-5" />}
          color="red"
          description="P0 & P1 articles"
        />
      </div>

      {/* Category & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistribution distribution={dashboardData.category_distribution} />
        <PriorityDistribution distribution={dashboardData.priority_distribution} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={dashboardData.recent_activity} />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  description, 
  trend 
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  description?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryDistribution({ distribution }: { distribution: Record<ArticleCategory, number> }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const sortedCategories = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 categories

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Category Distribution
      </h3>
      <div className="space-y-3">
        {sortedCategories.map(([category, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryBadgeColor(category as ArticleCategory)}>
                  {getCategoryLabel(category as ArticleCategory)}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {count} articles
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {Math.round(percentage)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityDistribution({ distribution }: { distribution: Record<Priority, number> }) {
  const priorities: Priority[] = ['P0_BREAKING', 'P1_TRENDING', 'P2_TIMELY', 'P3_EVERGREEN', 'P4_FILLER'];
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Priority Distribution
      </h3>
      <div className="space-y-3">
        {priorities.map((priority) => {
          const count = distribution[priority] || 0;
          return (
            <div key={priority} className="flex items-center justify-between">
              <Badge className={getPriorityBadgeColor(priority)}>
                {getPriorityLabel(priority)}
              </Badge>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No recent activity
        </p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{activity.action}</span>
                  {' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {activity.article_title}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatRelativeDate(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96" />
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getTopCategory(distribution: Record<ArticleCategory, number>): string {
  const [topCategory] = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)[0] || ['N/A', 0];
  
  return getCategoryLabel(topCategory as ArticleCategory);
}

function getHighPriorityCount(distribution: Record<Priority, number>): number {
  return (distribution.P0_BREAKING || 0) + (distribution.P1_TRENDING || 0);
}