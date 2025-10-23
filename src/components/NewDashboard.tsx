import React, { useState } from 'react';
import StatCard from './dashboard/StatCard';
import ActivityFeed from './dashboard/ActivityFeed';
import PendingArticlesOverview from './dashboard/PendingArticlesOverview';
import ScoreDistributionChart from './dashboard/ScoreDistributionChart';
import FeedHealthMonitor from './dashboard/FeedHealthMonitor';
import QuickActions from './dashboard/QuickActions';
import { toast } from 'react-hot-toast';

export function NewDashboard() {
  const [user] = useState({
    id: 1,
    name: 'Anna Kowalska',
    email: 'anna.kowalska@opix.pl',
    role: 'ADMIN'
  });

  // Mock data for dashboard statistics
  const [dashboardStats] = useState({
    totalArticles: 1247,
    pendingReview: 23,
    averageScore: 7.8,
    activeFeeds: 15,
    todayProcessed: 45,
    weeklyGrowth: '+12%'
  });

  const [pendingCounts] = useState({
    NEW: 8,
    PENDING_REVIEW: 15,
    NEEDS_MORE: 5
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'article_accepted',
      user: 'Piotr Nowak',
      action: 'accepted article',
      target: 'React 18 - Nowe funkcje',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      type: 'article_rejected',
      user: 'Maria Wisniewska',
      action: 'rejected article',
      target: 'Outdated CSS practices',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      id: 3,
      type: 'feed_added',
      user: 'Anna Kowalska',
      action: 'added new RSS source',
      target: 'TechCrunch AI',
      timestamp: new Date(Date.now() - 900000)
    },
    {
      id: 4,
      type: 'bulk_operation',
      user: 'Tomasz Kowalczyk',
      action: 'performed bulk operation on',
      target: '12 articles',
      timestamp: new Date(Date.now() - 1200000)
    },
    {
      id: 5,
      type: 'user_login',
      user: 'Katarzyna Zielinska',
      action: 'logged into system',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);

  const [scoreDistribution] = useState([
    { name: 'Relevance', value: 8.2 },
    { name: 'Novelty', value: 7.5 },
    { name: 'Virality', value: 6.8 },
    { name: 'Value', value: 8.9 },
    { name: 'Final', value: 7.8 }
  ]);

  const [categoryDistribution] = useState([
    { name: 'AI/ML', value: 145 },
    { name: 'Web Dev', value: 298 },
    { name: 'Mobile', value: 187 },
    { name: 'DevOps', value: 156 },
    { name: 'Security', value: 123 },
    { name: 'Other', value: 338 }
  ]);

  const [feedStats] = useState({
    active: 15,
    errors: 2,
    inactive: 3
  });

  const [recentErrors] = useState([
    {
      id: 1,
      feedName: 'TechCrunch RSS',
      message: 'Connection timeout - time limit exceeded',
      severity: 'high' as const,
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 2,
      feedName: 'Dev.to Feed',
      message: 'XML parsing error - invalid structure',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'NEW': 
      case 'PENDING_REVIEW': 
      case 'NEEDS_MORE':
        // navigate(`/article-list?status=${action}`);
        toast.success(`Redirecting to articles: ${action}`);
        break;
      case 'BULK_ACCEPT': 
        toast.success('Redirecting to bulk operations...');
        // navigate('/article-list?bulk=true');
        break;
      case 'HIGH_PRIORITY': 
        toast.success('Redirecting to high priorities...');
        // navigate('/article-list?priority=P0_BREAKING,P1_TRENDING');
        break;
      case 'review_pending': 
        toast.success('Redirecting to pending review...');
        // navigate('/article-list?status=PENDING_REVIEW');
        break;
      case 'bulk_operations': 
        toast.success('Redirecting to bulk operations...');
        // navigate('/article-list?bulk=true');
        break;
      case 'add_feed': 
        toast.success('Redirecting to RSS sources management...');
        // navigate('/rss-feed-management?action=add');
        break;
      case 'manage_users': 
        toast.success('Redirecting to user management...');
        // navigate('/user-management');
        break;
      case 'export_data':
        toast.success('Data export started. File will be downloaded shortly.');
        break;
      case 'system_settings': 
        toast.success('System settings feature will be available soon.');
        break;
      default:
        break;
    }
  };

  const handleViewAllArticles = () => {
    toast.success('Redirecting to all articles...');
    // navigate('/article-list');
  };

  const handleViewFeedDetails = () => {
    toast.success('Redirecting to RSS sources management...');
    // navigate('/rss-feed-management');
  };

  const handleStatCardClick = (type: string) => {
    switch (type) {
      case 'articles': 
        toast.success('Redirecting to articles...');
        // navigate('/article-list');
        break;
      case 'feeds': 
        toast.success('Redirecting to RSS sources...');
        // navigate('/rss-feed-management');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="skote-page-title">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name}! Here's your activity overview.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Ostatnia aktualizacja
            </p>
            <p className="text-sm font-medium text-foreground">
              {new Date()?.toLocaleString('pl-PL')}
            </p>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Articles Count"
            value={dashboardStats?.totalArticles?.toLocaleString('pl-PL')}
            change={dashboardStats?.weeklyGrowth}
            changeType="positive"
            icon="FileText"
            description="All articles in the system"
            onClick={() => handleStatCardClick('articles')}
          />
          <StatCard
            title="Pending Review"
            value={dashboardStats?.pendingReview}
            icon="Clock"
            description="Articles requiring decisions"
            onClick={() => handleQuickAction('PENDING_REVIEW')}
          />
          <StatCard
            title="Average AI Score"
            value={dashboardStats?.averageScore}
            change="+0.3"
            changeType="positive"
            icon="TrendingUp"
            description="Average quality rating"
          />
          <StatCard
            title="Active RSS Sources"
            value={dashboardStats?.activeFeeds}
            icon="Rss"
            description="Working article sources"
            onClick={() => handleStatCardClick('feeds')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Articles Overview */}
            <PendingArticlesOverview
              pendingCounts={pendingCounts}
              onViewAll={handleViewAllArticles}
              onQuickAction={handleQuickAction}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScoreDistributionChart
                data={scoreDistribution}
                type="bar"
                title="Average AI Scores"
              />
              <ScoreDistributionChart
                data={categoryDistribution}
                type="pie"
                title="Category Distribution"
              />
            </div>

            {/* Feed Health Monitor */}
            <FeedHealthMonitor
              feedStats={feedStats}
              recentErrors={recentErrors}
              onViewDetails={handleViewFeedDetails}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions
              onAction={handleQuickAction}
              userRole={user?.role}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={recentActivities}
            />
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Przetworzone dzisiaj"
            value={dashboardStats?.todayProcessed}
            icon="CheckCircle"
            description="Articles reviewed today"
          />
          <StatCard
            title="Average Review Time"
            value="2.3 min"
            icon="Timer"
            description="Time per article"
          />
          <StatCard
            title="Acceptance Rate"
            value="78%"
            change="+5%"
            changeType="positive"
            icon="ThumbsUp"
            description="Procent zaakceptowanych"
          />
        </div>
      </div>
    </div>
  );
}